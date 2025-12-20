import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    required: function() {
      return !this.googleId; // Mobile required only if not using Google
    },
    trim: true
  },
  
  // Authentication
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not using Google
    }
  },
  
  // Google OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null values
  },
  profilePicture: {
    type: String // Google profile picture URL
  },
  
  // OTP for password reset
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Last Login
  lastLogin: {
    type: Date
  },
  
  // User's property requests
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  }],
  
  // User's reviews (for future)
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

const User = mongoose.model('User', userSchema);

export default User;
