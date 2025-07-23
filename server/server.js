// server.js

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose'); // Required for graceful shutdown
const app = require('./app');         // Your Express app from app.js
const { connectDB } = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware'); // For safety; already used in app.js? Remove if duplicated

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log('Database connection ready');

    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Initialize socket.io service (adjust path if needed)
    const socketService = require('./services/socketService');
    await socketService.initialize(server);
    console.log('Socket.io service initialized');

    // Graceful shutdown handler
    const gracefulShutdown = async () => {
      console.log('Received shutdown signal');
      server.close(async () => {
        console.log('HTTP server closed');
        try {
          await socketService.cleanup();
          await mongoose.connection.close();
          console.log('All connections closed');
          process.exit(0);
        } catch (err) {
          console.error('Error during cleanup:', err);
          process.exit(1);
        }
      });

      // Force exit if shutdown takes too long
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Process-level handlers for uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

startServer();
