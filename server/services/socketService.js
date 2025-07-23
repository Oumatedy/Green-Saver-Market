const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const { verifyToken } = require('../utils/jwtUtils');

class SocketService {
  constructor() {
    this.io = null;
    this.redisClient = null;
    this.userSockets = new Map(); // userId -> Set of socket.ids
    this.socketUsers = new Map(); // socket.id -> userId
  }

  async initialize(httpServer) {
    // Initialize Socket.IO
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL
          : 'http://localhost:3000',
        credentials: true
      }
    });

    // Set up Redis adapter if available
    if (process.env.REDIS_URL) {
      try {
        this.redisClient = createClient({ url: process.env.REDIS_URL });
        const pubClient = this.redisClient.duplicate();
        
        await Promise.all([
          this.redisClient.connect(),
          pubClient.connect()
        ]);
        
        this.io.adapter(createAdapter(this.redisClient, pubClient));
        console.log('Redis adapter enabled for Socket.IO');
      } catch (error) {
        console.error('Failed to initialize Redis adapter:', error);
      }
    }

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
          return next(new Error('Invalid token'));
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        };

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Handle connections
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle typing events
      socket.on('typing_start', (data) => {
        this.emitToUser(data.recipientId, 'typing_start', {
          userId: socket.user.id
        });
      });

      socket.on('typing_stop', (data) => {
        this.emitToUser(data.recipientId, 'typing_stop', {
          userId: socket.user.id
        });
      });

      // Handle read receipts
      socket.on('mark_read', async (data) => {
        try {
          await Message.updateMany(
            {
              senderId: data.senderId,
              recipientId: socket.user.id,
              read: false
            },
            { read: true }
          );

          this.emitToUser(data.senderId, 'messages_read', {
            by: socket.user.id
          });
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });
    });

    return this.io;
  }

  handleConnection(socket) {
    const userId = socket.user.id;

    // Add socket to user's set of sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);
    this.socketUsers.set(socket.id, userId);

    // Emit online status
    this.io.emit('user_status', {
      userId,
      status: 'online'
    });
  }

  handleDisconnect(socket) {
    const userId = this.socketUsers.get(socket.id);
    if (userId) {
      // Remove socket from user's set of sockets
      const userSockets = this.userSockets.get(userId);
      userSockets.delete(socket.id);

      // If no more sockets, user is offline
      if (userSockets.size === 0) {
        this.userSockets.delete(userId);
        this.io.emit('user_status', {
          userId,
          status: 'offline'
        });
      }

      this.socketUsers.delete(socket.id);
    }
  }

  emitToUser(userId, event, data) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  async cleanup() {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
        console.log('Redis connection closed');
      } catch (error) {
        console.error('Error closing Redis connection:', error);
      }
    }

    if (this.io) {
      this.io.close(() => {
        console.log('Socket.IO server closed');
      });
    }
  }
}

module.exports = new SocketService();
}

class SocketService {
  constructor() {
    this.io = null;
    this.pubClient = null;
    this.subClient = null;
    this.connectedUsers = new Map();
  }

  // Initialize Socket.IO server with Redis adapter
  async initialize(server) {
    try {
      this.io = new Server(server, {
        cors: {
          origin: process.env.FRONTEND_URL,
          methods: ['GET', 'POST'],
          credentials: true
        }
      });

      // Set up Redis adapter if available and REDIS_URL is configured
      if (redisAdapter && process.env.REDIS_URL) {
        try {
          this.pubClient = redisAdapter.createClient({ url: process.env.REDIS_URL });
          this.subClient = this.pubClient.duplicate();

          await Promise.all([
            this.pubClient.connect(),
            this.subClient.connect()
          ]);

          this.io.adapter(redisAdapter.createAdapter(this.pubClient, this.subClient));
          console.log('Socket.IO Redis adapter initialized successfully');
        } catch (error) {
          console.log('Failed to initialize Redis adapter, falling back to in-memory adapter:', error.message);
        }
      }

      this._setupEventHandlers();
      
      return createResponse(true, 'Socket.IO server initialized successfully');
    } catch (error) {
      console.error('Socket initialization error:', error);
      throw new Error('Failed to initialize socket server');
    }
  }

  // Set up socket event handlers
  _setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle user connection
      socket.on('user:connect', (userId) => this._handleUserConnect(socket, userId));

      // Handle joining chat rooms
      socket.on('room:join', (roomId) => this._handleRoomJoin(socket, roomId));

      // Handle leaving chat rooms
      socket.on('room:leave', (roomId) => this._handleRoomLeave(socket, roomId));

      // Handle chat messages
      socket.on('message:send', (data) => this._handleMessage(socket, data));

      // Handle typing indicators
      socket.on('typing:start', (data) => this._handleTyping(socket, data, true));
      socket.on('typing:stop', (data) => this._handleTyping(socket, data, false));

      // Handle order status updates
      socket.on('order:update', (data) => this._handleOrderUpdate(socket, data));

      // Handle disconnection
      socket.on('disconnect', () => this._handleDisconnect(socket));
    });
  }

  // Handle user connection
  async _handleUserConnect(socket, userId) {
    try {
      this.connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      
      // Join user's personal room for private messages
      socket.join(`user:${userId}`);
      
      this.io.emit('user:online', userId);
    } catch (error) {
      console.error('User connection error:', error);
      socket.emit('error', { message: 'Failed to connect user' });
    }
  }

  // Handle room joining
  async _handleRoomJoin(socket, roomId) {
    try {
      socket.join(roomId);
      
      // Notify room members
      socket.to(roomId).emit('room:joined', {
        userId: socket.userId,
        roomId
      });
    } catch (error) {
      console.error('Room join error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  // Handle room leaving
  async _handleRoomLeave(socket, roomId) {
    try {
      socket.leave(roomId);
      
      // Notify room members
      socket.to(roomId).emit('room:left', {
        userId: socket.userId,
        roomId
      });
    } catch (error) {
      console.error('Room leave error:', error);
      socket.emit('error', { message: 'Failed to leave room' });
    }
  }

  // Handle chat messages
  async _handleMessage(socket, { roomId, message, type = 'text' }) {
    try {
      const result = await storeMessage(MessageModel, {
        sender: socket.userId,
        room: roomId,
        content: message,
        type
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      const messageData = {
        id: result.data.message._id,
        sender: socket.userId,
        content: message,
        type,
        timestamp: result.data.message.createdAt
      };

      // Emit to room members
      this.io.to(roomId).emit('message:new', messageData);
    } catch (error) {
      handleSocketError(socket, error);
    }
  }

  // Handle typing indicators
  _handleTyping(socket, { roomId }, isTyping) {
    socket.to(roomId).emit(isTyping ? 'typing:started' : 'typing:stopped', {
      userId: socket.userId,
      roomId
    });
  }

  // Handle order status updates
  async _handleOrderUpdate(socket, { orderId, status, location }) {
    try {
      const result = await updateOrderStatus(OrderModel, orderId, status, location);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      const orderStatus = await getOrderStatus(orderId);
      
      // Emit to all clients interested in this order
      this.io.to(`order:${orderId}`).emit('order:updated', {
        ...orderStatus,
        updatedBy: socket.userId
      });
    } catch (error) {
      handleSocketError(socket, error);
    }
  }

  // Handle client disconnection
  _handleDisconnect(socket) {
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId);
      this.io.emit('user:offline', socket.userId);
    }
    console.log(`Client disconnected: ${socket.id}`);
  }

  // Public methods for external use

  // Emit event to specific user
  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Emit event to room
  emitToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  // Broadcast event to all connected clients
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get count of connected clients
  getConnectedClientsCount() {
    return this.connectedUsers.size;
  }

  // Clean up resources
  async cleanup() {
    try {
      if (this.pubClient) await this.pubClient.quit();
      if (this.subClient) await this.subClient.quit();
      if (this.io) await this.io.close();
    } catch (error) {
      console.error('Error during cleanup:', error.message);
    }
  }
}

module.exports = new SocketService();
