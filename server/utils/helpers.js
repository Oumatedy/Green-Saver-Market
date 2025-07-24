const crypto = require('crypto');

/**
 * Generate random token string of given length
 * @param {number} length 
 * @returns {string}
 */
function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date|string} date 
 */
function formatDateISO(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

module.exports = {
  generateRandomToken,
  formatDateISO,
};
