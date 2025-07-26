/**
 * tests/integration/paymentRoutes.test.js
 *
 * Integration tests for payment API routes.
 */

const request = require('supertest');
const app = require('../../server/app');

const userToken = 'Bearer valid-user-jwt-token';
const adminToken = 'Bearer valid-admin-jwt-token';

describe('Payment Routes', () => {
  test('GET /payments/methods - returns payment methods', async () => {
    const res = await request(app).get('/api/v1/payments/methods').set('Authorization', userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.methods).toContain('card');
  });

  test('POST /payments - creates a payment', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', userToken)
      .send({
        orderId: '60f0cbbf2f8fb814c8a04b29', // Use a valid test orderId here
        paymentMethod: 'card',
        amount: 100,
      });

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.paymentId).toBeDefined();
  });

  test('POST /payments/:paymentId/refund - rejects refund for non-admin', async () => {
    const res = await request(app)
      .post('/api/v1/payments/any-payment-id/refund')
      .set('Authorization', userToken)
      .send({
        amount: 10,
        reason: 'Refund test',
        refundMethod: 'original',
      });

    expect(res.statusCode).toBe(403);
  });

  test('POST /payments/:paymentId/refund - allows admin refund', async () => {
    const res = await request(app)
      .post('/api/v1/payments/any-payment-id/refund')
      .set('Authorization', adminToken)
      .send({
        amount: 10,
        reason: 'Admin refund test',
        refundMethod: 'original',
      });

    expect([200, 404]).toContain(res.statusCode);
  });
});
