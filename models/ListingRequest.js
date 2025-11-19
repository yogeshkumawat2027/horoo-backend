import mongoose from "mongoose";

const ListingRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // Only 10-digit mobile numbers
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    propertyType: {
      type: String,
      enum: ["room", "hostel", "flat", "hotel", "commercial", "house"],
    },
     status: {
      type: String,
      enum: [
        "new",
        "pending",
        "on-hold",
        "listed",
        "rejected",
        "fraud",
        "closed",
      ],
      default: "new",
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ListingRequest", ListingRequestSchema);
