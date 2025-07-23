// app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const { rateLimit } = require('express-rate-limit');

const app = express();
const apiRouter = express.Router();

// Security middleware
app.use(helmet());                 // Set security HTTP headers
app.use(mongoSanitize());          // Prevent NoSQL injection
app.use(xss());                    // Prevent XSS attacks using maintained sanitizer

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:3000',
  credentials: true,
}));

// Request body parsing middleware with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Response compression for performance
app.use(compression());

// Logging middleware in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting middleware to limit repeated requests
const limiter = rateLimit({
  max: 100,                     // max requests per IP
  windowMs: 60 * 60 * 1000,     // 1 hour window
  message: 'Too many requests from this IP, please try again after an hour!',
});

// Apply rate limiter to API routes
app.use('/api/', limiter);

// Define API routes with versioning
app.use('/api/v1', apiRouter);

// Import and mount route files
apiRouter.use('/products', require('./routes/productRoutes'));
apiRouter.use('/orders', require('./routes/orderRoutes'));
apiRouter.use('/users', require('./routes/userRoutes'));
apiRouter.use('/payments', require('./routes/paymentRoutes'));
apiRouter.use('/messages', require('./routes/messageRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = app;
