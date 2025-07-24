const { Server } = require('socket.io');
const Redis = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const { getOrderStatus, storeMessage, updateOrderStatus } = require('../utils/socketUtils');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Redis clients for scaling
  const pubClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    retry_strategy: (options) => {
      if (options.attempt > 10) {
        console.error('Redis connection failed after 10 attempts');
        return undefined;
      }
      return Math.min(options.attempt * 100, 3000);
    },
  });

  const subClient = pubClient.duplicate();

  [pubClient, subClient].forEach(client => {
    client.on('error', (err) => console.error('Redis Client Error:', err));
    client.on('connect', () => console.log('Redis Client Connected'));
  });

  Promise.all([pubClient.connect(), subClient.connect()])
    .then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log('Socket.io Redis adapter initialized');
    })
    .catch(err => console.error('Redis adapter initialization failed:', err));

  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.use(([event, ...args], next) => {
      const userId = socket.handshake.auth.userId;
      if (!userId && ['join-order', 'join-product'].includes(event)) {
        return next(new Error('Authentication required'));
      }
      next();
    });

    // Join product room event
    socket.on('join-product', async (productId) => {
      try {
        await socket.join(`product:${productId}`);
        socket.emit('product-joined', { productId });
        socket.to(`product:${productId}`).emit('product-viewer-joined', {
          productId,
          viewerCount: io.sockets.adapter.rooms.get(`product:${productId}`)?.size || 0,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join product room' });
      }
    });

    // Join order room event
    socket.on('join-order', async (orderId) => {
      try {
        await socket.join(`order:${orderId}`);
        socket.emit('order-joined', { orderId });
        const orderStatus = await getOrderStatus(orderId);
        socket.emit('order-status-update', orderStatus);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join order room' });
      }
    });

    socket.on('user-online', (userId) => {
      socket.userId = userId;
      connectedUsers.set(userId, {
        socketId: socket.id,
        lastActive: Date.now(),
      });
      socket.join(`user:${userId}`);
      socket.broadcast.emit('user-status-change', { userId, status: 'online' });
    });

    socket.on('heartbeat', () => {
      if (socket.userId) {
        connectedUsers.set(socket.userId, {
          socketId: socket.id,
          lastActive: Date.now(),
        });
      }
    });

    socket.on('send-message', async ({ recipientId, message }) => {
      try {
        const recipientSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === recipientId);
        if (recipientSocket) {
          recipientSocket.emit('new-message', {
            from: socket.userId,
            message,
            timestamp: Date.now(),
          });
        }
        await storeMessage(socket.userId, recipientId, message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        socket.broadcast.emit('user-status-change', {
          userId: socket.userId,
          status: 'offline',
        });
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', { message: 'An unexpected error occurred' });
    });
  });

  setInterval(() => {
    const now = Date.now();
    connectedUsers.forEach((data, userId) => {
      if (now - data.lastActive > 120000) { // 2 minutes inactivity
        connectedUsers.delete(userId);
        io.emit('user-status-change', { userId, status: 'offline' });
      }
    });
  }, 60000); // every 1 minute

  return io;
};

module.exports = setupSocket;
