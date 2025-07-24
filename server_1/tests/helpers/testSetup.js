const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup function to run before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Cleanup function to run after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Reset database between tests
afterEach(async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
});

// Mock Clerk authentication
const mockClerkMiddleware = (role = 'customer') => {
  return (req, res, next) => {
    req.auth = {
      userId: 'test-user-id',
      sessionId: 'test-session-id',
      role
    };
    next();
  };
};

// Create test data
const createTestData = {
  product: {
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: 'Vegetables',
    unit: 'kg',
    stockQuantity: 100,
    farmer: 'test-farmer-id'
  },
  order: {
    items: [{
      product: 'test-product-id',
      quantity: 2,
      price: 99.99
    }],
    shippingAddress: {
      address: 'Test Address',
      city: 'Test City',
      postalCode: '12345',
      country: 'Test Country'
    },
    paymentMethod: 'stripe'
  },
  user: {
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer'
  }
};

// Global test data helper
global.createTestData = async (model, data) => {
  const instance = new model(data);
  await instance.save();
  return instance;
};

// Global error handler test helper
global.expectError = async (promise, statusCode, message) => {
  try {
    await promise;
    throw new Error('Expected error was not thrown');
  } catch (error) {
    expect(error.statusCode).toBe(statusCode);
    if (message) {
      expect(error.message).toMatch(message);
    }
  }
};

// Mock Clerk authentication middleware globally
jest.mock('../../middlewares/authMiddleware', () => ({
  requireAuth: mockClerkMiddleware(),
  getAuth: () => ({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    role: 'customer'
  })
}));

module.exports = {
  mockClerkMiddleware,
  createTestData
};
