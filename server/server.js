// Load environment variables from .env file at project root
const dotenv = require('dotenv');
dotenv.config();

// Debug: Check if Clerk keys are loaded
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('========================');

// Core dependencies
const mongoose = require('mongoose');   // Mongoose for MongoDB connection
const app = require('./app');           // Express app with middleware and routes
const { connectDB } = require('./config/database');  // MongoDB connection utility

// Optional: error middleware import if you want to use global handlers here
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const PORT = process.env.PORT || 5000;
let server;  // Will hold the HTTP server instance

// Function to start the server asynchronously
const startServer = async () => {
  try {
    // 1. Connect to MongoDB before starting server
    await connectDB();
    console.log('Database connection ready');

    // 2. Create HTTP server from Express app and listen on provided PORT
    server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // 3. Initialize Socket.io service for realtime events
    //    Make sure you have ./services/socketService.js exporting initialize and cleanup methods
    const socketService = require('./services/socketService');
    await socketService.initialize(server);
    console.log('Socket.io service initialized');

    // 4. Handle graceful shutdown for clean exit on signals (SIGINT/SIGTERM)
    const gracefulShutdown = async () => {
      console.log('Received shutdown signal, closing server...');
      server.close(async () => {
        console.log('HTTP server closed');

        try {
          // Close socket connections/cleanup as defined in socketService
          await socketService.cleanup();

          // Close MongoDB connections
          await mongoose.connection.close();
          console.log('MongoDB connection closed');

          // Exit process once all connections closed properly
          process.exit(0);
        } catch (err) {
          console.error('Error during server shutdown cleanup:', err);
          process.exit(1);
        }
      });

      // Failsafe: force shutdown if cleanup takes longer than 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals (Ctrl+C or container stop)
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    // Fatal error starting server, log and exit
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Global process-level handlers for severe errors

// Handle uncaught exceptions (synchronous errors not caught)
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections (async errors not caught)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  if (server) {
    // Try closing server gracefully if possible before exit
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Call the start function to begin server initialization
startServer();
