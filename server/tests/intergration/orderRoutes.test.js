/**
 * tests/integration/orderRoutes.test.js
 *
 * Integration tests for Order API routes.
 */

const request = require('supertest');
const app = require('../../server/app'); // Update path if needed
const mongoose = require('mongoose');

const userToken = 'Bearer valid-user-jwt-token';
const adminToken = 'Bearer valid-admin-jwt-token';

describe('Order Routes', () => {
  let createdOrderId;

  test('POST /orders - create a new order', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', userToken)
      .send({
        user: new mongoose.Types.ObjectId().toString(),
        items: [
          { productId: new mongoose.Types.ObjectId().toString(), quantity: 2 }
        ],
        totalAmount: 59.99,
        status: 'pending'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    createdOrderId = res.body._id;
  });

  test('GET /orders/:orderId - get order details', async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${createdOrderId}`)
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(createdOrderId);
  });

  test('GET /orders - list orders for user', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PATCH /orders/:orderId - update an order (admin only)', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/${createdOrderId}`)
      .set('Authorization', adminToken)
      .send({ status: 'shipped' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('shipped');
  });

  test('DELETE /orders/:orderId - delete an order (admin only)', async () => {
    const res = await request(app)
      .delete(`/api/v1/orders/${createdOrderId}`)
      .set('Authorization', adminToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
