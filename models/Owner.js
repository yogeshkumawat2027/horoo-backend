import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema({
  // Basic Information
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
    required: true,
    unique: true,
    trim: true
  },

  // Authentication
  password: {
    type: String,
    required: true
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

  // Verification Status
  isVerifiedOwner: {
    type: Boolean,
    default: false
  },

  // Owner Address
  address: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },

  // Listings - References to all property types
  flats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flat'
  }],
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],
  hostels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  }],
  hotels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelRoom'
  }],
  houses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House'
  }],
  commercials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commercial'
  }],
  mess: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess'
  }],

  // Additional Information
  alternateNumber: {
    type: String,
    trim: true
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Last Login
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// ✅ No need for manual indexes - 'unique: true' already creates them
// Removed duplicate indexes to fix warnings:
// - email index (already created by unique: true)
// - mobile index (already created by unique: true)

const Owner = mongoose.model('Owner', ownerSchema);

export default Owner;
