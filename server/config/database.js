/**
 * MongoDB connection setup with Mongoose.
 * Includes event logging, graceful shutdown, and connection options.
 */

const mongoose = require('mongoose');

// MongoDB connection options
const connectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true
};

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, connectOptions);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Export the connection function
module.exports = { connectToDatabase };

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
