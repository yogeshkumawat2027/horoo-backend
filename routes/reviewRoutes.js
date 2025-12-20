import express from 'express';
import { 
  createReview, 
  editReviewByUser, 
  editReviewByAdmin, 
  deleteReviewByUser, 
  deleteReviewByAdmin, 
  getPropertyReviews, 
  getAllReviews, 
  getUserReviews 
} from '../controllers/reviewController.js';
import { verifyUserToken } from '../middlewares/userAuth.js';

const router = express.Router();

// User routes (require authentication)
router.post('/review', verifyUserToken, createReview); // Create a review
router.put('/review/:reviewId', verifyUserToken, editReviewByUser); // Edit own review
router.delete('/review/:reviewId', verifyUserToken, deleteReviewByUser); // Delete own review
router.get('/my-reviews', verifyUserToken, getUserReviews); // Get user's own reviews

// Public routes
router.get('/reviews/:propertyType/:propertyId', getPropertyReviews); // Get all reviews for a property

// Admin routes (will need admin middleware later)
router.get('/reviews', getAllReviews); // Get all reviews (admin)
router.put('/admin/review/:reviewId', editReviewByAdmin); // Edit any review (admin)
router.delete('/admin/review/:reviewId', deleteReviewByAdmin); // Delete any review (admin)

export default router;
