const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const dotenv = require('dotenv');
const { connectDB } = require('../server/config/database');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Load environment variables at the very top
dotenv.config();

// Validate required environment variables
const requiredVars = ['MONGODB_URI', 'PORT', 'JWT_SECRET'];

// Optionally require NODE_ENV only in production
if (process.env.NODE_ENV === 'production') {
  requiredVars.push('NODE_ENV', 'CLERK_SECRET_KEY');
}

requiredVars.forEach(variable => {
  if (!process.env[variable]) {
    throw new Error(`${variable} environment variable is required`);
  }
});


const app = express();

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Sanitize data against NoSQL query injection
app.use(xss()); // Clean user input from malicious HTML/JavaScript XSS attacks

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true
}));

// Request parsing middleware
app.use(express.json({ limit: '10kb' })); // Body parser with size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Performance middleware
app.use(compression()); // Compress response bodies

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});


// Apply rate limiter to all routes
app.use('/api/', limiter);

// Connect to database
connectDB().then(() => {
  console.log('Database connection ready');
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes with versioning
const apiRouter = express.Router();
app.use('/api/v1', apiRouter);

apiRouter.use('/products', require('./routes/productRoutes'));
apiRouter.use('/orders', require('./routes/orderRoutes'));
apiRouter.use('/users', require('./routes/userRoutes'));
apiRouter.use('/payments', require('./routes/paymentRoutes'));
apiRouter.use('/messages', require('./routes/messageRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Initialize socket.io
    const socketService = require('./services/socketService');
    await socketService.initialize(server);
    console.log('Socket.io service initialized');

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Received shutdown signal');
      
      // Stop accepting new requests
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          // Cleanup resources
          await socketService.cleanup();
          await mongoose.connection.close();
          console.log('All connections closed');
          process.exit(0);
        } catch (err) {
          console.error('Error during cleanup:', err);
          process.exit(1);
        }
      });

      // Force close if graceful shutdown takes too long
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Start the server
startServer();
