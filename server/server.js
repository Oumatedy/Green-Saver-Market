// Load environment variables from .env file at project root
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Check if environment is properly configured
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded ✓' : 'Missing ✗');
console.log('CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('========================');

// Core dependencies
const app = require('./app');           // Express app with middleware and routes
const { connectToDatabase } = require('./config/database');  // MongoDB connection utility
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Function to start the server asynchronously
const startServer = async () => {
  try {
    // Connect to MongoDB before starting server
    await connectToDatabase();

    // Start the server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Received shutdown signal, closing server...');
      server.close(async () => {
        console.log('HTTP server closed');
        process.exit(0);
      });
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

// Global process-level handlers for severe errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Call the start function to begin server initialization
startServer();
