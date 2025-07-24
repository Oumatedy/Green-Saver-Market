/**
 * Clerk configuration utils.
 * Environment variables provide Clerk API keys.
 * This file can be expanded if need custom Clerk initialization.
 */

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  console.warn('Warning: CLERK_SECRET_KEY is not defined in environment variables');
}

module.exports = {
  clerkSecretKey,
};
