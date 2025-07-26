/**
 * tests/unit/paymentController.test.js
 *
 * Unit and integration tests for PaymentController methods and routes.
 */

const request = require('supertest');
const app = require('../../server/app'); // Adjust path as needed
const mongoose = require('mongoose');
const Payment = require('../../server/models/paymentModel');
const Order = require('../../server/models/orderModel');

const userToken = 'Bearer valid-user-jwt-token';
const adminToken = 'Bearer valid-admin-jwt-token';

let testOrder;
let testPaymentId;

describe('PaymentController', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost/testdb');
    }

    testOrder = await Order.create({
      user: new mongoose.Types.ObjectId(),
      pricing: { total: 100 },
      paymentStatus: 'pending',
      status: 'pending',
    });
  });

  afterAll(async () => {
    await Payment.deleteMany({});
    await Order.deleteMany({});
    await mongoose.connection.close();
  });

  test('GET /payments/methods - should return payment methods', async () => {
    const res = await request(app)
      .get('/api/v1/payments/methods')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.methods).toEqual(expect.arrayContaining(['card', 'bank_transfer', 'cash', 'mobile_money']));
  });

  test('POST /payments - should create a payment', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', userToken)
      .send({
        orderId: testOrder._id.toString(),
        paymentMethod: 'card',
        amount: 100,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.paymentId).toBeDefined();
    testPaymentId = res.body.paymentId;
  });

  test('GET /payments/:paymentId/status - should get payment status', async () => {
    const res = await request(app)
      .get(`/api/v1/payments/${testPaymentId}/status`)
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
  });

  test('POST /payments/:paymentId/refund - non-admin should be forbidden', async () => {
    const res = await request(app)
      .post(`/api/v1/payments/${testPaymentId}/refund`)
      .set('Authorization', userToken)
      .send({
        amount: 50,
        reason: 'Test refund',
        refundMethod: 'original',
      });

    expect(res.statusCode).toBe(403);
  });

  test('POST /payments/:paymentId/refund - admin should process refund', async () => {
    const res = await request(app)
      .post(`/api/v1/payments/${testPaymentId}/refund`)
      .set('Authorization', adminToken)
      .send({
        amount: 50,
        reason: 'Admin refund test',
        refundMethod: 'original',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.payment.status).toBe('refunded');
  });
});
