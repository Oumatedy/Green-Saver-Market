const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('./appError');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d';

/**
 * Generate JWT token with user payload (e.g., id, role)
 * @param {Object} payload 
 * @param {string|number} expiresIn 
 */
function generateToken(payload, expiresIn = JWT_EXPIRATION) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT token and return decoded payload
 * @param {string} token 
 * @throws UnauthorizedError if invalid or expired
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
