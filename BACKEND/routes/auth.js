// routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, getUser, ensureAuthenticated } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();


// User Registration Route
router.post('/register', registerUser);

// User Login Route
router.post('/login', loginUser);

// Get User Information (Protected Route)
router.get('/user', auth, getUser);

// Example protected route for OAuth session users
router.get('/profile', ensureAuthenticated, (req, res) => {
  // Only send safe user info
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email
  });
});

module.exports = router;
