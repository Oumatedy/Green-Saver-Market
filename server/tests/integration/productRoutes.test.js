const request = require('supertest');
const app = require('../../../backend/app');
const Product = require('../../models/productModel');

describe('Product Routes', () => {
  beforeEach(async () => {
    await Product.deleteMany({});
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product when admin', async () => {
      // TODO: Add test with admin auth
    });

    it('should not create a product without auth', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          category: 'Test Category',
          imageUrl: 'test.jpg',
        });

      expect(response.status).toBe(401);
    });
  });
});
