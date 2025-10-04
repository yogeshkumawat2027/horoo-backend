
import mongoose from 'mongoose';

const masterAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

const MasterAdmin = mongoose.model('MasterAdmin', masterAdminSchema);
export default MasterAdmin;