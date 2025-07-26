/**
 * tests/unit/authMiddleware.test.js
 *
 * Tests for authMiddleware functionality.
 */

const express = require('express');
const request = require('supertest');
const { authMiddleware } = require('../../server/middlewares/authMiddleware');

const app = express();

app.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({ userId: req.user?.userId });
});

describe('authMiddleware', () => {
  test('rejects request without authorization header', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
  });

  test('rejects request with invalid token', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toBe(401);
  });

  test('allows request with valid token', async () => {
    // You should replace this with a valid JWT for your environment or mock accordingly
    const validToken = 'Bearer valid-user-jwt-token';

    const res = await request(app).get('/protected').set('Authorization', validToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.userId).toBeDefined();
  });
});
