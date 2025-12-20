import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT Token (valid for 90 days - 3 months)
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "horoo_user_secret_key_2024",
    { expiresIn: "90d" } // 90 days = 3 months
  );
};

// User Registration (Email & Password)
export const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, mobile, password, confirmPassword"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit mobile number"
      });
    }

    // Password strength validation (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Check if user already exists with email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      isActive: true
    });

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      data: userResponse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Registration failed: ${error.message}`
    });
  }
};

// User Login (Email & Password)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('requests');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support."
      });
    }

    // Check if user registered with Google
    if (user.googleId && !user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was created with Google. Please login with Google."
      });
    }

    // Check password using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otp;
    delete userResponse.otpExpiry;

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: userResponse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Login failed: ${error.message}`
    });
  }
};

// Google OAuth Success Handler
export const googleAuthSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    const user = req.user;

    // Generate JWT token
    const token = generateToken(user._id);

    // Always redirect to home - user can complete profile later from profile page
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);

  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

// Google OAuth Failure Handler
export const googleAuthFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
};

// Complete Profile (Add name and mobile for Google users)
export const completeProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, mobile } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name"
      });
    }

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Please provide mobile number"
      });
    }

    // Mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit mobile number"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, mobile },
      { new: true }
    ).select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile completed successfully",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update profile: ${error.message}`
    });
  }
};

// Request Password Reset OTP
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email"
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email"
      });
    }

    // Check if user registered with Google
    if (user.googleId && !user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was created with Google. Please login with Google."
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to database
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // TODO: Send OTP via email
    console.log(`OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent to your email successfully",
      // Remove this in production
      otp: otp 
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to send OTP: ${error.message}`
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and OTP"
      });
    }

    // Find user with matching email and OTP
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      otp: otp
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Check if OTP has expired
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `OTP verification failed: ${error.message}`
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Find user with matching email and OTP
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      otp: otp
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP"
      });
    }

    // Check if OTP has expired
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successful. You can now login with your new password."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Password reset failed: ${error.message}`
    });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('requests')
      .select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch profile: ${error.message}`
    });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated this way
    delete updates.password;
    delete updates.email;
    delete updates.googleId;
    delete updates.otp;
    delete updates.otpExpiry;
    delete updates.requests;
    delete updates.reviews;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select('-password -otp -otpExpiry');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update profile: ${error.message}`
    });
  }
};

// Get All Users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -otp -otpExpiry')
      .populate('requests')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch users: ${error.message}`
    });
  }
};

// Deactivate User Account (Admin only)
export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password -otp -otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User account deactivated successfully",
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to deactivate user: ${error.message}`
    });
  }
};
