import express from 'express';
import {
  registerUser,
  loginUser,
  completeProfile,
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deactivateUser
} from '../controllers/userController.js';
import { verifyUserToken } from '../middlewares/userAuth.js';

const router = express.Router();

// Public Routes - Email/Password Authentication
router.post('/register', registerUser);
router.post('/login', loginUser);

// Public Routes - Password Reset
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected User Routes - Profile Management (requires JWT token)
router.get('/profile/:userId', verifyUserToken, getUserProfile);
router.put('/profile/:userId', verifyUserToken, updateUserProfile);
router.put('/complete-profile/:userId', verifyUserToken, completeProfile);

// Admin Routes - User Management
router.get('/all', getAllUsers);
router.put('/deactivate/:userId', deactivateUser);

export default router;
