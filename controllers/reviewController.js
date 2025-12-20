import Review from "../models/Review.js";
import Room from "../models/Room.js";
import Flat from "../models/Flat.js";
import Hostel from "../models/Hostel.js";
import HotelRoom from "../models/HotelRoom.js";
import House from "../models/House.js";
import Commercial from "../models/Commercial.js";
import Mess from "../models/Mess.js";

// Helper function to get property model based on type
const getPropertyModel = (propertyType) => {
  const models = {
    Room,
    Flat,
    Hostel,
    HotelRoom,
    House,
    Commercial,
    Mess
  };
  return models[propertyType];
};

// Create Review (User)
export const createReview = async (req, res) => {
  try {
    const { propertyType, propertyId, rating, message } = req.body;
    const userId = req.user._id; // from auth middleware

    // Validate required fields
    if (!propertyType || !propertyId || !rating || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (propertyType, propertyId, rating, message)"
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Verify property exists
    const PropertyModel = getPropertyModel(propertyType);
    if (!PropertyModel) {
      return res.status(400).json({
        success: false,
        message: "Invalid property type"
      });
    }

    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({
      user: userId,
      propertyId,
      propertyType
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this property"
      });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      propertyType,
      propertyId,
      rating,
      message
    });

    // Add review to property's reviews array
    if (!property.reviews) {
      property.reviews = [];
    }
    property.reviews.push(review._id);
    
    // Update average rating and total ratings
    if (property.averageRating !== undefined && property.totalRatings !== undefined) {
      const currentTotal = property.averageRating * property.totalRatings;
      property.totalRatings += 1;
      property.averageRating = (currentTotal + rating) / property.totalRatings;
    }
    
    await property.save();

    // Populate user details
    await review.populate('user', 'name email profilePicture');

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message
    });
  }
};

// Edit Review by User (Own Review)
export const editReviewByUser = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, message } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own reviews"
      });
    }

    // Update fields
    const oldRating = review.rating;
    let ratingChanged = false;
    
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5"
        });
      }
      if (rating !== oldRating) {
        ratingChanged = true;
        review.rating = rating;
      }
    }

    if (message !== undefined) {
      review.message = message;
    }

    await review.save();
    
    // Update property average rating if rating changed
    if (ratingChanged) {
      const PropertyModel = getPropertyModel(review.propertyType);
      const property = await PropertyModel.findById(review.propertyId);
      
      if (property && property.averageRating !== undefined && property.totalRatings !== undefined && property.totalRatings > 0) {
        const currentTotal = property.averageRating * property.totalRatings;
        const newTotal = currentTotal - oldRating + rating;
        property.averageRating = newTotal / property.totalRatings;
        await property.save();
      }
    }
    
    await review.populate('user', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review
    });
  } catch (error) {
    console.error("Edit review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit review",
      error: error.message
    });
  }
};

// Edit Review by Admin
export const editReviewByAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, message, isApproved, isActive } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Admin can update any field
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5"
        });
      }
      review.rating = rating;
    }

    if (message !== undefined) {
      review.message = message;
    }

    if (isApproved !== undefined) {
      review.isApproved = isApproved;
    }

    if (isActive !== undefined) {
      review.isActive = isActive;
    }

    await review.save();
    await review.populate('user', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: "Review updated successfully by admin",
      data: review
    });
  } catch (error) {
    console.error("Edit review by admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit review",
      error: error.message
    });
  }
};

// Delete Review by User (Own Review)
export const deleteReviewByUser = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews"
      });
    }

    // Remove review from property's reviews array and update average rating
    const PropertyModel = getPropertyModel(review.propertyType);
    const property = await PropertyModel.findById(review.propertyId);
    
    if (property) {
      // Remove review from array
      property.reviews = property.reviews.filter(r => r.toString() !== review._id.toString());
      
      // Update average rating
      if (property.averageRating !== undefined && property.totalRatings !== undefined && property.totalRatings > 0) {
        const currentTotal = property.averageRating * property.totalRatings;
        property.totalRatings -= 1;
        
        if (property.totalRatings > 0) {
          property.averageRating = (currentTotal - review.rating) / property.totalRatings;
        } else {
          property.averageRating = 3.5; // Reset to default if no reviews left
        }
      }
      
      await property.save();
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message
    });
  }
};

// Delete Review by Admin
export const deleteReviewByAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    // Remove review from property's reviews array and update average rating
    const PropertyModel = getPropertyModel(review.propertyType);
    const property = await PropertyModel.findById(review.propertyId);
    
    if (property) {
      // Remove review from array
      property.reviews = property.reviews.filter(r => r.toString() !== review._id.toString());
      
      // Update average rating
      if (property.averageRating !== undefined && property.totalRatings !== undefined && property.totalRatings > 0) {
        const currentTotal = property.averageRating * property.totalRatings;
        property.totalRatings -= 1;
        
        if (property.totalRatings > 0) {
          property.averageRating = (currentTotal - review.rating) / property.totalRatings;
        } else {
          property.averageRating = 3.5; // Reset to default if no reviews left
        }
      }
      
      await property.save();
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully by admin"
    });
  } catch (error) {
    console.error("Delete review by admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message
    });
  }
};

// Get Reviews for a Property
export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyType, propertyId } = req.params;

    const reviews = await Review.find({
      propertyType,
      propertyId,
      isActive: true,
      isApproved: true
    })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error("Get property reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

// Get User's Reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;

    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user reviews",
      error: error.message
    });
  }
};

// Get All Reviews (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const { isApproved, isActive } = req.query;
    const filter = {};

    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true';
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const reviews = await Review.find(filter)
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};
