import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const verifyUserToken = async (req, res, next) => {
  try {
    
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "horoo_user_secret_key_2024"
    );

   
    const user = await User.findById(decoded.userId).select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated."
      });
    }

    // Attach user to request
    req.user = user;
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
