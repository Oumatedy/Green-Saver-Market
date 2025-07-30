const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const { clerkMiddleware, getAuth } = require('@clerk/express');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Configure CORS
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug: Verify Clerk keys are loaded
console.log('=== CLERK CONFIGURATION DEBUG ===');
console.log('CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Loaded ✓' : 'Missing ✗');
console.log('===================================');

// Health check route (no auth required)
app.use('/api/v1/health', require('./routes/healthRoute'));

/**
 * 1. Security Middlewares (Applied before other middlewares)
 */

// Helmet for security headers (configured for development)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false // Prevent conflicts with other middleware
}));

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors()); // Enable pre-flight across the board

/**
 * 2. Request Parsing & Compression
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

/**
 * 3. Logging (development only)
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

/**
 * 4. Rate Limiting (before authentication)
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

/**
 * 5. Data Sanitization (applied carefully to avoid conflicts)
 */
// MongoDB injection prevention (configured to avoid Express 5 conflicts)
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized potentially dangerous key: ${key}`);
  }
}));

// XSS protection
app.use(xss());

/**
 * 6. Clerk Authentication Middleware
 */
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

/**
 * 7. Health Check Route (before API routes)
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * 8. Root Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Green Saver Market API',
    version: process.env.API_VERSION || '1.0.0',
    documentation: '/api/v1/docs'
  });
});

/**
 * 9. API Routes Setup
 */
const apiRouter = express.Router();

// Import route modules
const productRoutes = require('./routes/productRoute');
const orderRoutes = require('./routes/orderRoute');
const userRoutes = require('./routes/userRoute');
const messageRoutes = require('./routes/messageRoute');
const paymentRoutes = require('./routes/paymentRoute');
const adminOrderRoutes = require('./routes/adminOrderRoute');

// Mount API routes
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/admin/orders', adminOrderRoutes);

// Protected route example using Clerk
apiRouter.get('/profile', (req, res) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized - Please sign in to access this resource' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'User authenticated successfully', 
      userId: userId
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication service error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test route for debugging
apiRouter.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Mount the API router
app.use('/api/v1', apiRouter);

/**
 * Serve frontend static files
 */
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

/**
 * 10. Error Handling Middleware (Must be last)
 */
app.use(notFound);
app.use(errorHandler);

module.exports = app;