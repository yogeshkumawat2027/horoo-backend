import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // User who created the review
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // Property reference - can be any property type
    propertyType: { 
      type: String, 
      enum: ["Room", "Flat", "Hostel", "HotelRoom", "House", "Commercial", "Mess"],
      required: true 
    },
    
    propertyId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      refPath: 'propertyType' // Dynamic reference based on propertyType
    },

    // Review content
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5
    },

    message: { 
      type: String, 
      required: true,
      trim: true
    },

    // Status
    isApproved: { 
      type: Boolean, 
      default: true  // Changed to true so reviews show immediately (can be changed to false if you want admin approval)
    },

    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Index for faster queries
reviewSchema.index({ propertyId: 1, propertyType: 1 });
reviewSchema.index({ user: 1 });

export default mongoose.model("Review", reviewSchema);
