/**
 * Socket.io configuration options for real-time communication.
 * CORS and other options can be customized here.
 */

const corsOrigin = process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000';

const ioOptions = {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // You can add more Socket.io options here if needed
};

module.exports = ioOptions;
