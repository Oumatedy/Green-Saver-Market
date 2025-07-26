/**
 * tests/integration/productRoutes.test.js
 *
 * Integration tests for Product API routes.
 */

const request = require('supertest');
const app = require('../../server/app');
const mongoose = require('mongoose');

const adminToken = 'Bearer valid-admin-jwt-token';
const userToken = 'Bearer valid-user-jwt-token';

describe('Product Routes', () => {
  let createdProductId;

  test('POST /products - create a new product (admin only)', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', adminToken)
      .send({
        name: 'Test Product',
        description: 'A product created during testing',
        price: 25.5,
        stock: 100,
        categories: ['electronics', 'testing'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.name).toBe('Test Product');
    createdProductId = res.body._id;
  });

  test('GET /products/:productId - get product details', async () => {
    const res = await request(app)
      .get(`/api/v1/products/${createdProductId}`)
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(createdProductId);
  });

  test('GET /products - get product list', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PATCH /products/:productId - update product data (admin only)', async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${createdProductId}`)
      .set('Authorization', adminToken)
      .send({ price: 30.0, stock: 80 });

    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(30.0);
    expect(res.body.stock).toBe(80);
  });

  test('DELETE /products/:productId - delete product (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/v1/products/${createdProductId}`)
      .set('Authorization', adminToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
