/**
 * Check if an email string is valid
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email) return false;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Check if a password meets strength requirements
 * Example: at least 8 chars, one upper, one lower, one number
 * @param {string} password
 * @returns {boolean}
 */
export function isStrongPassword(password) {
  if (!password) return false;
  // This regex enforces min 8 chars, at least one uppercase, one lowercase, and one digit
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return pattern.test(password);
}

/**
 * Check if a string is non-empty
 * @param {string} value
 * @returns {boolean}
 */
export function isRequired(value) {
  return value != null && value.toString().trim() !== "";
}
