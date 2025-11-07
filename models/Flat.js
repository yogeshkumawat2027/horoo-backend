import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    
    horooId: { type: String, unique: true },
    
    propertyName: { type: String, required: true }, // Real name (not shown to users)
    horooName: { type: String, required: true },   // Name shown on website
    ownerName: { type: String, required: true },
    ownerMobile: { type: String, required: true },
    anotherNo: { type: String }, // optional

    // Location
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true },
    pincode: { type: String, required: true },
    nearbyAreas: [{ type: String }], // array of strings
    mapLink: { type: String },
    realAddress: { type: String },
    horooAddress: { type: String }, // address shown to users

    // Features
    facilities: [{ type: String }], // array of facilities
    ownerPrice: { type: Number, required: true },
    horooPrice: { type: Number, required: true },
    offerType: { type: String }, // e.g. discount, special, festival
    pricePlans: [
      {
      type : String
      }
    ],
    flatType: { type: [String], enum: ["1BHK", "2BHK", "3BHK"] },

    availableFor: { type: [String], enum: ["Boys", "Girls", "Family"] },
    roomSize: { type: String }, // e.g. 10x12 ft
    roomType: { type: [String], enum: ["Single", "Double", "Triple"] },
    quantity: { type: Number, default: 1 },
    availability: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    isShow: { type: Boolean, default: false },

    mainImage: { type: String }, // Cloudinary link
    otherImages: [{ type: String }],
    youtubeLink: { type: String },

    description: { type: String }, // shown to users (editor content)
    horooDescription: { type: String }, // internal use (customer support)
    
  },
  { timestamps: true }
);

// Add indexes for faster queries
flatSchema.index({ isShow: 1, createdAt: -1 });
flatSchema.index({ state: 1, city: 1, area: 1 });
flatSchema.index({ flatType: 1 });
flatSchema.index({ availableFor: 1 });
flatSchema.index({ horooId: 1 });

export default mongoose.model("Flat", flatSchema);


