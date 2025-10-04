import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config(); 

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'horoo-properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto:good' },
    ],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  },
});

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Upload Base64 Image to Cloudinary
const uploadBase64ToCloudinary = async (base64String, folder = 'horoo-properties') => {
  try {
    return await cloudinary.uploader.upload(base64String, {
      folder,
      transformation: [
        { width: 800, height: 600, crop: 'fill', quality: 'auto:good' },
      ],
    });
  } catch (error) {
    console.error('Cloudinary base64 upload error:', error);
    throw error;
  }
};

export { cloudinary, upload, deleteFromCloudinary, uploadBase64ToCloudinary };
