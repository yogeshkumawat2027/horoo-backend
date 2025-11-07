import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    // Horoo ID - Auto generated
    horooId: { type: String, unique: true },
    
    // Basic property details
    propertyName: { type: String }, // Real name (not shown to users)
    horooName: { type: String, },   // Name shown on website
    ownerName: { type: String, required: true },
    ownerMobile: { type: String, required: true },
    anotherNo: { type: String }, // optional

    // Location
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true },
    pincode: { type: String },
    nearbyAreas: [{ type: String }], // array of strings
    mapLink: { type: String },
    realAddress: { type: String },
    horooAddress: { type: String }, // address shown to users

    // Features
    facilities: [{ type: String }], // array of facilities
    ownerPrice: { type: Number, required: true },
    horooPrice: { type: Number },
    offerType: { type: String }, // e.g. discount, special, festival
    pricePlans: [
      {
      type : String
      }
    ],

    // Availability & Options
    availableFor: { type: [String], enum: ["Boys", "Girls", "Family"] },
    roomSize: { type: String }, 
    roomType: { type: [String], enum: ["Single", "Double", "Triple"] },
    quantity: { type: Number, default: 1 },
    availability: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    isShow: { type: Boolean, default: false },

    // Media
    mainImage: { type: String }, // Cloudinary linkmainImage,otherImages 
    otherImages: [{ type: String }],
    youtubeLink: { type: String },

    // Descriptions
    description: { type: String }, // shown to users (editor content)
    horooDescription: { type: String }, // internal use (customer support)

    
  },
  { timestamps: true }
);

// Add indexes for faster queries
roomSchema.index({ isShow: 1, createdAt: -1 });
roomSchema.index({ state: 1, city: 1, area: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ availableFor: 1 });
roomSchema.index({ horooId: 1 });

export default mongoose.model("Room", roomSchema);
