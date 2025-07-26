/**
 * tests/helpers/testSetup.js
 *
 * Setup script to run before tests:
 * - Connects to MongoDB test database
 * - Disconnects after tests
 * - Can add global mocks or environment config here
 */

const mongoose = require('mongoose');

beforeAll(async () => {
  const uri = process.env.MONGO_URI_TEST || 'mongodb://localhost/testdb';
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
