/**
 * MongoDB connection setup with Mongoose.
 * Supports switching between local and Atlas environments.
 * Includes event logging, graceful shutdown, and connection options.
 */

const mongoose = require('mongoose');

const {
  DB_TYPE,
  MONGODB_URI_LOCAL,
  MONGODB_URI_ATLAS
} = process.env;

// Choose the database URI based on DB_TYPE
const dbUri = DB_TYPE === 'atlas' ? MONGODB_URI_ATLAS : MONGODB_URI_LOCAL;

// MongoDB connection options (updated to remove deprecated ones)
const connectOptions = {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
};

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(dbUri, connectOptions);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Event logs
mongoose.connection.on('connected', () => {
  console.log(`✅ MongoDB connected to ${DB_TYPE.toUpperCase()} at ${dbUri}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB connection disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed via app termination (SIGINT)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during MongoDB disconnection:', err);
    process.exit(1);
  }
});

module.exports = { connectToDatabase };
