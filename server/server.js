// Load environment variables from .env file
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Check if environment is properly configured
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DB_TYPE:', process.env.DB_TYPE);
console.log('MONGODB_URI_LOCAL:', process.env.MONGODB_URI_LOCAL ? 'Loaded ✓' : 'Missing ✗');
console.log('MONGODB_URI_ATLAS:', process.env.MONGODB_URI_ATLAS ? 'Loaded ✓' : 'Missing ✗');
console.log('CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('========================');

// Core dependencies
const app = require('./app');
const { connectToDatabase } = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Function to start the server
const startServer = async () => {
  try {
    // Connect to MongoDB before starting server
    await connectToDatabase();

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async () => {
      console.log('📦 Received shutdown signal, closing server...');
      server.close(async () => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('⏱️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Global process-level error handlers
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();
