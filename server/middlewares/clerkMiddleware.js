const { Clerk } = require('@clerk/clerk-sdk-node');
const { CLERK_SECRET_KEY } = process.env;

const clerk = new Clerk({ secretKey: CLERK_SECRET_KEY });

const validateClerkToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the token with Clerk
      const session = await clerk.sessions.verifySession(token);
      if (!session) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Add user data to request
      req.user = {
        clerkId: session.userId,
        sessionId: session.id
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { validateClerkToken };
