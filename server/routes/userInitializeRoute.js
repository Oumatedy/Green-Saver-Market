const express = require('express');
const router = express.Router();
const { validateClerkToken } = require('../middlewares/authMiddleware');
const User = require('../models/userModel');

// Public route to initialize user after Clerk login
router.post('/users/initialize', validateClerkToken, async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, imageUrl, role } = req.body;
    
    if (!clerkId || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find existing user or create new one
    let user = await User.findOne({ clerkId });
    
    if (!user) {
      // Create new user with provided role or default to customer
      user = await User.create({
        clerkId,
        email,
        name: `${firstName} ${lastName}`,
        role: role || 'customer',
        profile: { 
          avatar: imageUrl 
        }
      });
    } else {
      // Update existing user's information
      user.email = email;
      user.name = `${firstName} ${lastName}`;
      user.profile.avatar = imageUrl;
      await user.save();
    }

    // Return user data without sensitive information
    return res.json({ 
      _id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      profile: user.profile
    });
  } catch (err) {
    console.error('User initialization error:', err);
    res.status(500).json({ message: 'Failed to initialize user' });
  }
});

module.exports = router;
