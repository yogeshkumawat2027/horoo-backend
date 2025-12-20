import express from 'express';
import {
  registerOwner,
  loginOwner,
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  getOwnerProfile,
  updateOwnerProfile,
  getAllOwners,
  verifyOwner,
  deactivateOwner
} from '../controllers/ownerController.js';
import { verifyOwnerToken, isVerifiedOwner } from '../middlewares/ownerAuth.js';

const router = express.Router();

// Public Routes - Authentication
router.post('/register', registerOwner);
router.post('/login', loginOwner);

// Public Routes - Password Reset
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected Owner Routes - Profile Management (requires JWT token)
router.get('/profile/:ownerId', verifyOwnerToken, getOwnerProfile);
router.put('/profile/:ownerId', verifyOwnerToken, updateOwnerProfile);

// Admin Routes - Owner Management (add admin middleware later)
router.get('/all', getAllOwners);
router.put('/verify/:ownerId', verifyOwner);
router.put('/deactivate/:ownerId', deactivateOwner);

export default router;
