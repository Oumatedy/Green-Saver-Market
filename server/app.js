const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const { clerkMiddleware, getAuth } = require('@clerk/express');
require('dotenv').config();

const app = express();
const apiRouter = express.Router();

/**
 * 1. Security Middlewares
 */
// Set secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet());

// Sanitize request data to prevent NoSQL injection attacks
app.use(mongoSanitize());

// Sanitize against XSS attacks by cleaning user input
app.use(xss());

/**
 * 2. CORS Configuration
 * Allow requests only from trusted frontend origin,
 * Credentials enabled for cookie/session support
 */
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:3000',
  credentials: true,
}));

/**
 * 3. Request Body Parsing
 * Parse JSON and URL-encoded bodies with size limits to prevent denial of service
 */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * 4. Response Compression
 * Compress text responses like JSON, HTML etc. for faster client loads
 */
app.use(compression());

/**
 * 5. Request Logging - only in development for debugging
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 * 6. Rate Limiting
 * Limit repeated requests to APIs to prevent brute force and DOS attacks
 */
const limiter = rateLimit({
  max: 100, // max requests per IP per hour
  windowMs: 60 * 60 * 1000, // 1 hour window
  message: 'Too many requests from this IP, please try again after an hour!',
});
app.use('/api/', limiter);

/**
 * 7. Clerk Middleware Integration
 * This middleware validates Clerk session tokens and attaches user info to every request.
 * Use `getAuth(req)` in routes/controllers to access authenticated user data (userId, sessionId, token)
 */
app.use(clerkMiddleware());

/**
 * 8. API Routes setup with versioning prefix /api/v1
 * Routes are split by domain - products, orders, users, payments, messages
 */
apiRouter.use('/products', require('./routes/productRoutes'));
apiRouter.use('/orders', require('./routes/orderRoutes'));
apiRouter.use('/users', require('./routes/userRoutes'));
apiRouter.use('/payments', require('./routes/paymentRoutes'));
apiRouter.use('/messages', require('./routes/messageRoutes'));

app.use('/api/v1', apiRouter);

/**
 * 9. Sample protected route example to check authentication status
 * Returns userId if authenticated, 401 Unauthorized otherwise
 */
app.get('/api/v1/profile', (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized - no user session found' });
  }

  res.json({ message: 'User authenticated', userId });
});

/**
 * 10. Basic Health Check Endpoint
 * Useful for uptime monitors and load balancers
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = app;
