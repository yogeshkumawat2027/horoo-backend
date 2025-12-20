import jwt from "jsonwebtoken";
import Owner from "../models/Owner.js";

// Middleware to verify owner JWT token
export const verifyOwnerToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "horoo_owner_secret_key_2024"
    );

    // Find owner
    const owner = await Owner.findById(decoded.ownerId).select("-password -otp -otpExpiry");

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Owner not found."
      });
    }

    // Check if account is active
    if (!owner.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated."
      });
    }

    // Attach owner to request
    req.owner = owner;
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token."
    });
  }
};

// Middleware to verify owner is verified
export const isVerifiedOwner = (req, res, next) => {
  if (!req.owner.isVerifiedOwner) {
    return res.status(403).json({
      success: false,
      message: "Your account is not verified. Please complete verification process."
    });
  }
  next();
};
