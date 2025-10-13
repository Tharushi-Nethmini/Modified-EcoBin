const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  password: {
    type: String,
    required: false, // security fix: allow null for OAuth users
  },
  address: {
    type: String,
    required: false, // security fix: allow null for OAuth users
  },
  district: {
    type: String,
    required: false, // security fix: allow null for OAuth users
  },
  phoneNumber: {
    type: String,
    required: false, // security fix: allow null for OAuth users
  },
  user_type: {
    type: String,
    enum: ['admin', 'user'], // Optional: Only allow specific user types
    default: 'user', // Default to 'user' if not specified
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // security fix: allow either local or google users
  },
}, { timestamps: true }); // This will automatically add createdAt and updatedAt timestamps


module.exports = mongoose.model('User', userSchema);
