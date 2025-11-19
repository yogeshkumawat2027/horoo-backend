import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  otp: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
