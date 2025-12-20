import mongoose from "mongoose";

const flatSchema = new mongoose.Schema(
  {
    
    horooId: { type: String, unique: true },
    slug: { type: String, unique: true, sparse: true }, // SEO-friendly URL slug from horooName (sparse allows null/undefined)
    
    propertyName: { type: String, required: true }, // Real name (not shown to users)
    horooName: { type: String, required: true },   // Name shown on website
    ownerName: { type: String, required: true },
    ownerMobile: { type: String, required: true },
    ownerWhatsapp: { type: String }, // optional
    anotherNo: { type: String }, // optional

    // Location
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State", required: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true },
    pincode: { type: String, required: true },
    nearbyAreas: [{ type: String }], // array of strings
    mapLink: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    realAddress: { type: String },
    horooAddress: { type: String }, // address shown to users

    // Features
    facilities: [{ type: String }], // array of facilities
    ownerPrice: { type: Number, required: true },
    horooPrice: { type: Number, required: true },
    priceSuffix: { type: String, enum: ["per month", "per day", "per night", "per hour"] },
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

    // Reviews and Ratings
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    averageRating: { type: Number, default: 3.5, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    
  },
  { timestamps: true }
);



export default mongoose.model("Flat", flatSchema);


