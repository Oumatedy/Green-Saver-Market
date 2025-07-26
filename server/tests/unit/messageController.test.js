/**
 * tests/unit/messageController.test.js
 *
 * Unit tests for MessageController methods.
 */

const request = require('supertest');
const app = require('../../server/app');
const mongoose = require('mongoose');
const User = require('../../server/models/userModel');
const Message = require('../../server/models/messageModel');

const userToken = 'Bearer user-jwt-token';

describe('MessageController', () => {
  let userId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost/testdb');
    }
    const user = await User.create({ name: 'Test User', email: 'testuser@example.com' });
    userId = user._id;
  });

  afterAll(async () => {
    await Message.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  test('POST /messages - should send a message', async () => {
    const recipient = await User.create({ name: 'Recipient', email: 'recipient@example.com' });

    const res = await request(app)
      .post('/api/v1/messages')
      .set('Authorization', userToken)
      .send({
        recipientId: recipient._id.toString(),
        content: 'Test message content',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe('Test message content');
  });

  test('GET /messages/conversations - should get conversations', async () => {
    const res = await request(app)
      .get('/api/v1/messages/conversations')
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /messages/search - should search messages', async () => {
    const res = await request(app)
      .get('/api/v1/messages/search')
      .query({ query: 'Test' })
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PATCH /messages/:messageId/read - should mark message as read', async () => {
    const message = await Message.create({
      senderId: userId,
      recipientId: userId,
      content: 'Read test message',
      read: false,
    });

    const res = await request(app)
      .patch(`/api/v1/messages/${message._id}/read`)
      .set('Authorization', userToken);

    expect(res.statusCode).toBe(200);
    expect(res.body.read).toBe(true);
  });
});
