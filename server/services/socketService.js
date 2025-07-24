const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const { verifyToken } = require('../utils/jwt');

/**
 * Helper function to handle errors during socket events
 * and emit error messages to the client.
 * @param {Socket} socket 
 * @param {Error} error
 */
function handleSocketError(socket, error) {
  console.error('Socket Error:', error);
  socket.emit('error', { message: error.message || 'Unknown error occurred' });
}

class SocketService {
  constructor() {
    this.io = null;
    this.pubClient = null;
    this.subClient = null;
    this.userSockets = new Map();  // userId -> Set of socket IDs
    this.socketUsers = new Map();  // socket.id -> userId
  }

  /**
   * Initialize the Socket.IO server and Redis adapter (if configured).
   * Adds authentication middleware and sets up event handlers.
   * @param {http.Server} httpServer
   * @returns {Promise<Server>} Promise resolving with the io server instance.
   */
  async initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL
          : 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Setup Redis adapter if REDIS_URL is configured
    if (process.env.REDIS_URL) {
      try {
        this.pubClient = createClient({ url: process.env.REDIS_URL });
        this.subClient = this.pubClient.duplicate();

        await Promise.all([
          this.pubClient.connect(),
          this.subClient.connect(),
        ]);
        
        this.io.adapter(createAdapter(this.pubClient, this.subClient));
        console.log('Socket.IO Redis adapter initialized successfully');
      } catch (error) {
        console.warn('Failed to initialize Redis adapter, falling back to in-memory adapter:', error.message);
      }
    }

    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication token required'));

        const decoded = await verifyToken(token);
        if (!decoded) return next(new Error('Invalid token'));

        const user = await User.findById(decoded.userId).lean();
        if (!user) return next(new Error('User not found'));

        socket.user = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Setup socket event handlers
    this._setupEventHandlers();

    return this.io;
  }

  /**
   * Setup all socket event handlers
   */
  _setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.user.id;

      // Track socket <-> user mappings
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(socket.id);
      this.socketUsers.set(socket.id, userId);

      console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);

      // Notify all clients user is online
      this.io.emit('user_status', { userId, status: 'online' });

      // Join user personal room for private emits
      socket.join(`user:${userId}`);

      // Handle disconnect
      socket.on('disconnect', () => {
        this._handleDisconnect(socket);
      });

      // Handle joining chat rooms
      socket.on('room:join', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('room:joined', { userId, roomId });
      });

      // Handle leaving chat rooms
      socket.on('room:leave', (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit('room:left', { userId, roomId });
      });

      // Handle new chat messages
      socket.on('message:send', async (data) => {
        try {
          // Expected data: { roomId, message, type (optional) }
          const { roomId, message, type = 'text' } = data;

          // Store message in DB
          const msgDoc = await Message.create({
            senderId: userId,
            roomId,
            content: message,
            type,
            createdAt: new Date(),
          });

          const messageData = {
            id: msgDoc._id,
            senderId: userId,
            content: message,
            type,
            timestamp: msgDoc.createdAt,
          };

          // Emit message to room
          this.io.to(roomId).emit('message:new', messageData);
        } catch (error) {
          handleSocketError(socket, error);
        }
      });

      // Handle typing indicators
      socket.on('typing:start', (data) => {
        // data: { roomId }
        socket.to(data.roomId).emit('typing:started', { userId, roomId: data.roomId });
      });

      socket.on('typing:stop', (data) => {
        // data: { roomId }
        socket.to(data.roomId).emit('typing:stopped', { userId, roomId: data.roomId });
      });

      // Handle order status updates - example, customize as per your app logic
      socket.on('order:update', async (data) => {
        try {
          // data: { orderId, status, location }
          // You need to implement order update logic separately (e.g., via a service)
          // For example:
          //   await OrderService.updateStatus(data.orderId, data.status, data.location);

          // Emit updated status to interested parties (like order room)
          this.io.to(`order:${data.orderId}`).emit('order:updated', {
            orderId: data.orderId,
            status: data.status,
            updatedBy: userId,
            location: data.location,
            timestamp: new Date(),
          });
        } catch (error) {
          handleSocketError(socket, error);
        }
      });

      // Handle marking messages as read (optional)
      socket.on('mark_read', async (data) => {
        try {
          await Message.updateMany(
            {
              senderId: data.senderId,
              recipientId: userId,
              read: false,
            },
            { read: true }
          );

          this.emitToUser(data.senderId, 'messages_read', { by: userId });
        } catch (error) {
          handleSocketError(socket, error);
        }
      });
    });
  }

  /**
   * Handle client disconnect
   * @param {Socket} socket
   */
  _handleDisconnect(socket) {
    const userId = this.socketUsers.get(socket.id);
    if (!userId) return;

    // Remove socket from user's socket set
    const socketsSet = this.userSockets.get(userId);
    if (socketsSet) {
      socketsSet.delete(socket.id);
      if (socketsSet.size === 0) {
        this.userSockets.delete(userId);
        // Broadcast offline status only if no sockets remain
        this.io.emit('user_status', { userId, status: 'offline' });
      }
    }

    this.socketUsers.delete(socket.id);

    console.log(`User disconnected: ${userId} (Socket ID: ${socket.id})`);
  }

  /**
   * Emit an event to all sockets of a specific user
   * @param {string} userId 
   * @param {string} event 
   * @param {any} data 
   */
  emitToUser(userId, event, data) {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds) return;

    socketIds.forEach(socketId => {
      this.io.to(socketId).emit(event, data);
    });
  }

  /**
   * Emit an event to all clients in a room
   * @param {string} roomId 
   * @param {string} event 
   * @param {any} data 
   */
  emitToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  /**
   * Broadcast event to all connected clients
   * @param {string} event 
   * @param {any} data 
   */
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Check if a user is online (has any connected sockets)
   * @param {string} userId 
   * @returns {boolean}
   */
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  /**
   * Get count of connected clients across all users
   * @returns {number}
   */
  getConnectedClientsCount() {
    return this.socketUsers.size;
  }

  /**
   * Cleanup resources gracefully
   */
  async cleanup() {
    try {
      if (this.pubClient) await this.pubClient.quit();
      if (this.subClient) await this.subClient.quit();
      if (this.io) {
        await this.io.close();
        console.log('Socket.IO server closed');
      }
    } catch (error) {
      console.error('Error during SocketService cleanup:', error.message);
    }
  }
}

module.exports = new SocketService();
