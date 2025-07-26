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
// Prevent NoSQL injection (safe configuration)
app.use(mongoSanitize({
  onSanitize: ({ req, key }) => {
    console.warn(`This request[${key}] is sanitized`);
  },
}));


app.use(helmet()); // Secure HTTP headers


// Prevent XSS attacks
app.use(xss());

/**
 * 2. CORS Configuration
 */
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:3000',
  credentials: true,
}));

/**
 * 3. Request Parsing
 */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * 4. Response Compression
 */
app.use(compression());

/**
 * 5. Logging (dev only)
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 * 6. Rate Limiting
 */
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again after an hour!',
});
app.use('/api/', limiter);

/**
 * 7. Clerk Middleware
 */
app.use(clerkMiddleware());

/**
 * 8. API Routes (/api/v1)
 */
const adminOrderRoutes = require('./routes/adminOrderRoute');
apiRouter.use('/products', require('./routes/productRoute'));
apiRouter.use('/orders', require('./routes/orderRoute'));
apiRouter.use('/users', require('./routes/userRoute'));
apiRouter.use('/payments', require('./routes/paymentRoute'));
apiRouter.use('/messages', require('./routes/messageRoute'));
apiRouter.use('/admin/orders', adminOrderRoutes);

// 🔐 Protected route example
apiRouter.get('/profile', (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized - no user session found' });
  }
  res.json({ message: 'User authenticated', userId });
});

// Mount versioned API router
app.use('/api/v1', apiRouter);

/**
 * 9. Root Route (Optional for clarity)
 */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Green Saver Market API',
    docs: '/api/v1',
  });
});

/**
 * 10. Error Handling
 */
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

/**
 * 11. Health Check
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});



module.exports = app;
