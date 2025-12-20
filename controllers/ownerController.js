import Owner from "../models/Owner.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT Token (valid for 90 days - 3 months)
const generateToken = (ownerId) => {
  return jwt.sign(
    { ownerId },
    process.env.JWT_SECRET || "horoo_owner_secret_key_2024",
    { expiresIn: "90d" } // 90 days = 3 months
  );
};

// Owner Registration
export const registerOwner = async (req, res) => {
  try {
    const { name, email, mobile, password, confirmPassword, address, state, city, pincode, alternateNumber } = req.body;

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

    // Check if owner already exists with email or mobile
    const existingOwnerEmail = await Owner.findOne({ email });
    if (existingOwnerEmail) {
      return res.status(400).json({
        success: false,
        message: "Owner with this email already exists"
      });
    }

    const existingOwnerMobile = await Owner.findOne({ mobile });
    if (existingOwnerMobile) {
      return res.status(400).json({
        success: false,
        message: "Owner with this mobile number already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new owner
    const newOwner = await Owner.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      address,
      state,
      city,
      pincode,
      alternateNumber,
      isVerifiedOwner: false, // Initially not verified
      isActive: true
    });

    // Generate JWT token
    const token = generateToken(newOwner._id);

    // Remove password from response
    const ownerResponse = newOwner.toObject();
    delete ownerResponse.password;

    res.status(201).json({
      success: true,
      message: "Owner registered successfully. Please verify your account.",
      token,
      data: ownerResponse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Registration failed: ${error.message}`
    });
  }
};

// Owner Login (via email or mobile)
export const loginOwner = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    // Validation
    if (!emailOrMobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email/mobile and password"
      });
    }

    // Find owner by email or mobile
    const owner = await Owner.findOne({
      $or: [
        { email: emailOrMobile.toLowerCase() },
        { mobile: emailOrMobile }
      ]
    }).populate('flats rooms hostels hotels houses commercials mess');

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if account is active
    if (!owner.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support."
      });
    }

    // Check password using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, owner.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Update last login
    owner.lastLogin = new Date();
    await owner.save();

    // Generate JWT token
    const token = generateToken(owner._id);

    // Remove password from response
    const ownerResponse = owner.toObject();
    delete ownerResponse.password;
    delete ownerResponse.otp;
    delete ownerResponse.otpExpiry;

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: ownerResponse
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Login failed: ${error.message}`
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

    // Find owner by email
    const owner = await Owner.findOne({ email: email.toLowerCase() });
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email"
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiry (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to database
    owner.otp = otp;
    owner.otpExpiry = otpExpiry;
    await owner.save();

    // TODO: Send OTP via email
    // This requires email service integration (nodemailer, SendGrid, etc.)
    console.log(`OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent to your email successfully",
      // Remove this in production - only for testing
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

    // Find owner with matching email and OTP
    const owner = await Owner.findOne({ 
      email: email.toLowerCase(),
      otp: otp
    });

    if (!owner) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Check if OTP has expired
    if (owner.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      ownerId: owner._id
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

    // Find owner with matching email and OTP
    const owner = await Owner.findOne({ 
      email: email.toLowerCase(),
      otp: otp
    });

    if (!owner) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP"
      });
    }

    // Check if OTP has expired
    if (owner.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    owner.password = hashedPassword;
    owner.otp = null;
    owner.otpExpiry = null;
    await owner.save();

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

// Get Owner Profile
export const getOwnerProfile = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId)
      .populate('flats rooms hostels hotels houses commercials mess')
      .select('-password -otp -otpExpiry');

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found"
      });
    }

    res.json({
      success: true,
      data: owner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch profile: ${error.message}`
    });
  }
};

// Update Owner Profile
export const updateOwnerProfile = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated this way
    delete updates.password;
    delete updates.email;
    delete updates.mobile;
    delete updates.otp;
    delete updates.otpExpiry;
    delete updates.flats;
    delete updates.rooms;
    delete updates.hostels;
    delete updates.hotels;
    delete updates.houses;
    delete updates.commercials;
    delete updates.mess;

    const updatedOwner = await Owner.findByIdAndUpdate(
      ownerId,
      updates,
      { new: true }
    ).select('-password -otp -otpExpiry');

    if (!updatedOwner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedOwner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update profile: ${error.message}`
    });
  }
};

// Get All Owners (Admin only)
export const getAllOwners = async (req, res) => {
  try {
    const owners = await Owner.find()
      .select('-password -otp -otpExpiry')
      .populate('flats rooms hostels hotels houses commercials mess')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: owners.length,
      data: owners
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch owners: ${error.message}`
    });
  }
};

// Verify Owner Account (Admin only)
export const verifyOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findByIdAndUpdate(
      ownerId,
      { isVerifiedOwner: true },
      { new: true }
    ).select('-password -otp -otpExpiry');

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found"
      });
    }

    res.json({
      success: true,
      message: "Owner verified successfully",
      data: owner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to verify owner: ${error.message}`
    });
  }
};

// Deactivate Owner Account (Admin only)
export const deactivateOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findByIdAndUpdate(
      ownerId,
      { isActive: false },
      { new: true }
    ).select('-password -otp -otpExpiry');

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found"
      });
    }

    res.json({
      success: true,
      message: "Owner account deactivated successfully",
      data: owner
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to deactivate owner: ${error.message}`
    });
  }
};
