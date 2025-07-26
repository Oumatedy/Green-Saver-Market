/**
 * tests/unit/validationMiddleware.test.js
 *
 * Tests input validation middleware.
 */

const express = require('express');
const request = require('supertest');
const { body } = require('express-validator');
const { validate } = require('../../server/middlewares/validationMiddleware');

const app = express();
app.use(express.json());

app.post(
  '/validate-test',
  [
    body('email').isEmail().withMessage('Must be a valid email'),
    body('age').isInt({ min: 18 }).withMessage('Must be at least 18'),
  ],
  validate(),
  (req, res) => {
    res.json({ message: 'Validation passed' });
  }
);

describe('validationMiddleware', () => {
  test('rejects invalid input', async () => {
    const res = await request(app).post('/validate-test').send({ email: 'invalid', age: 16 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('accepts valid input', async () => {
    const res = await request(app).post('/validate-test').send({ email: 'test@example.com', age: 30 });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Validation passed');
  });
});
