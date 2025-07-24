# Green Saver Market - Backend API

A comprehensive Node.js/Express backend for the Green Saver Market application, connecting farmers directly with consumers for fresh produce delivery.

## Features

- **User Management**: Customer, farmer, and admin roles with Clerk authentication
- **Product Management**: Full CRUD operations for products with categories, stock tracking
- **Order Processing**: Complete order lifecycle management with status tracking
- **Payment Processing**: Secure payment handling with multiple methods
- **Real-time Analytics**: Comprehensive statistics and reporting
- **File Upload**: Image handling for products with validation
- **Email Notifications**: Automated notifications for orders and updates

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk for secure authentication
- **Validation**: Express-validator for input validation
- **Security**: Helmet, CORS, rate limiting
- **Testing**: Jest and Supertest
- **Documentation**: API documentation with examples

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Clerk account for authentication

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd server
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update environment variables:
\`\`\`env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/green-saver-market
CLERK_API_KEY=your_clerk_api_key
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints

### Authentication
All protected routes require a valid Clerk JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Products
- \`GET /api/products\` - Get all products with filtering
- \`GET /api/products/:id\` - Get product by ID
- \`POST /api/products\` - Create new product (farmers/admin only)
- \`PUT /api/products/:id\` - Update product (farmers/admin only)
- \`DELETE /api/products/:id\` - Delete product (farmers/admin only)
- \`PATCH /api/products/:id/stock\` - Update product stock

### Orders
- \`GET /api/orders\` - Get orders (filtered by user role)
- \`GET /api/orders/:id\` - Get order by ID
- \`POST /api/orders\` - Create new order
- \`PATCH /api/orders/:id/status\` - Update order status (farmers/admin only)
- \`GET /api/orders/stats/overview\` - Get order statistics (admin only)

### Users
- \`GET /api/users/profile\` - Get current user profile
- \`GET /api/users/:id\` - Get user by ID
- \`PUT /api/users/:id\` - Update user profile
- \`GET /api/users\` - Get all users (admin only)
- \`DELETE /api/users/:id\` - Delete user (admin only)
- \`GET /api/users/stats/overview\` - Get user statistics (admin only)

### Payments
- \`POST /api/payments\` - Create payment
- \`GET /api/payments/:paymentId/status\` - Get payment status
- \`GET /api/payments\` - Get all payments (admin only)
- \`POST /api/payments/:paymentId/refund\` - Process refund (admin only)
- \`GET /api/payments/stats/overview\` - Get payment statistics (admin only)

## Data Models

### User Model
\`\`\`javascript
{
  clerkId: String,
  email: String,
  name: String,
  role: ['customer', 'farmer', 'admin'],
  profile: {
    bio: String,
    location: String,
    phone: String,
    avatar: String
  },
  status: ['active', 'suspended', 'pending'],
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Product Model
\`\`\`javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  farmerId: ObjectId,
  organic: Boolean,
  stock: Number,
  inStock: Boolean,
  unit: String,
  rating: Number,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Order Model
\`\`\`javascript
{
  orderId: String,
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    productName: String,
    quantity: Number,
    price: Number,
    farmerId: ObjectId
  }],
  subtotal: Number,
  shipping: Number,
  tax: Number,
  total: Number,
  status: String,
  shippingAddress: Object,
  paymentMethod: String,
  paymentStatus: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Error Handling

The API uses a consistent error response format:

\`\`\`javascript
{
  success: false,
  message: "Error description",
  errors: [] // Array of detailed errors (for validation)
}
\`\`\`

Common HTTP status codes:
- \`200\` - Success
- \`201\` - Created
- \`400\` - Bad Request (validation errors)
- \`401\` - Unauthorized
- \`403\` - Forbidden
- \`404\` - Not Found
- \`500\` - Internal Server Error

## Security Features

- **Authentication**: Clerk JWT token validation
- **Authorization**: Role-based access control
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Data Sanitization**: Prevents XSS attacks

## Development

### Running Tests
\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

### Code Linting
\`\`\`bash
npm run lint
\`\`\`

### Testing Environment
The project uses:
- Jest as the testing framework
- MongoDB Memory Server for test database
- Supertest for API testing
- Mock implementations for external services

## Deployment

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
CLERK_API_KEY=your_production_clerk_key
JWT_SECRET=your_production_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://your-frontend-domain.com
\`\`\`

### Deployment Steps
1. Build the application
2. Set environment variables
3. Deploy to your preferred platform (Railway, Render, AWS, etc.)
4. Configure MongoDB Atlas for production database
5. Set up monitoring and logging

## Project Structure
\`\`\`
backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middlewares/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── tests/           # Test files
├── utils/           # Utility functions
├── uploads/         # File upload directory
└── server.js        # Application entry point
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
