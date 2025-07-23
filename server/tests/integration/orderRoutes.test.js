const request = require('supertest');
const app = require('../../../backend/server');
const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const { 
  connectDB, 
  disconnectDB, 
  clearDatabase, 
  mockClerkMiddleware,
  createTestData 
} = require('../helpers/testSetup');

describe('Order Routes', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDatabase();
    // Mock Clerk authentication middleware
    app.use(mockClerkMiddleware());
  });

  describe('GET /api/orders', () => {
    it('should get all orders for authenticated user', async () => {
      // Create test order
      const order = await Order.create({
        ...createTestData.order,
        user: 'test-user-id'
      });

      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0]._id.toString()).toBe(order._id.toString());
    });

    it('should return 401 without authentication', async () => {
      app.use((req, res, next) => {
        delete req.auth;
        next();
      });

      await request(app)
        .get('/api/orders')
        .expect(401);
    });
  });

  describe('POST /api/orders', () => {
    let product;

    beforeEach(async () => {
      product = await Product.create(createTestData.product);
    });

    it('should create a new order', async () => {
      const orderData = {
        ...createTestData.order,
        items: [{
          product: product._id,
          quantity: 2,
          price: product.price
        }]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.user).toBe('test-user-id');
      expect(response.body.data.order.items).toHaveLength(1);
    });

    it('should validate order input', async () => {
      const invalidOrder = {
        items: [],
        shippingAddress: { address: '' }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should check stock availability', async () => {
      const orderData = {
        ...createTestData.order,
        items: [{
          product: product._id,
          quantity: 1000, // More than available stock
          price: product.price
        }]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient stock');
    });
  });

  describe('GET /api/orders/:id', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        ...createTestData.order,
        user: 'test-user-id'
      });
    });

    it('should get order by id', async () => {
      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order._id.toString()).toBe(order._id.toString());
    });

    it('should not get order of different user', async () => {
      app.use(mockClerkMiddleware('customer'));
      
      const otherOrder = await Order.create({
        ...createTestData.order,
        user: 'other-user-id'
      });

      await request(app)
        .get(`/api/orders/${otherOrder._id}`)
        .expect(403);
    });
  });

  describe('PUT /api/orders/:id', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        ...createTestData.order,
        user: 'test-user-id'
      });
    });

    it('should update order status', async () => {
      app.use(mockClerkMiddleware('farmer'));

      const response = await request(app)
        .put(`/api/orders/${order._id}`)
        .send({ status: 'processing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('processing');
    });

    it('should not allow invalid status transitions', async () => {
      app.use(mockClerkMiddleware('farmer'));

      const response = await request(app)
        .put(`/api/orders/${order._id}`)
        .send({ status: 'delivered' }) // Can't go directly to delivered
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        ...createTestData.order,
        user: 'test-user-id'
      });
    });

    it('should cancel order', async () => {
      const response = await request(app)
        .delete(`/api/orders/${order._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const updatedOrder = await Order.findById(order._id);
      expect(updatedOrder.status).toBe('cancelled');
    });

    it('should not cancel order after processing started', async () => {
      await Order.findByIdAndUpdate(order._id, { status: 'processing' });

      const response = await request(app)
        .delete(`/api/orders/${order._id}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
