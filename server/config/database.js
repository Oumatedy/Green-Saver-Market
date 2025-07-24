/**
 * MongoDB connection setup with Mongoose.
 * Includes event logging, graceful shutdown, and connection options.
 */

const mongoose = require('mongoose');

// Log when successfully connected to MongoDB
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connection established');
});

// Log any MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Log when disconnected from MongoDB
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB connection disconnected');
});

// Graceful shutdown: Close mongoose connection before app termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed through app termination (SIGINT)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during MongoDB disconnection:', err);
    process.exit(1);
  }
});

/**
 * Connect to MongoDB with options optimized for production and dev use.
 * Reads MONGODB_URI from environment (.env).
 */
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI_PROD || process.env.MONGODB_URI
        : process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB connection string (MONGODB_URI) is missing in environment variables');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,       // Use MongoDB driver's new connection string parser
      useUnifiedTopology: true,    // Use the new Server Discover and Monitoring engine
      maxPoolSize: 10,             // Maintain up to 10 socket connections in pool
      serverSelectionTimeoutMS: 5000,  // Keep trying to send operations for 5 seconds after failing to connect
      socketTimeoutMS: 45000,           // Close sockets after 45s inactivity
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };
