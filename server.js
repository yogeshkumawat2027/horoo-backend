import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import locationRoutes from './routes/locationRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import flatRoutes from './routes/flatRoutes.js';
import hostelRoutes from './routes/hostelRoutes.js';
import hotelRoomRoutes from './routes/hotelRoomRoutes.js';
import houseRoutes from './routes/houseRoutes.js';
import messRoutes from './routes/messRoutes.js';
import commercialRoutes from './routes/commercialRoutes.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from "./routes/requestRoutes.js";
import listingRequestRoutes from "./routes/listingRequestRoutes.js";
import ownerRoutes from './routes/ownerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();


//middleware 
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://horoo.in",
    "https://admin.horoo.in",
    "https://www.horoo.in",
    "http://horoo.in",
    "http://www.horoo.in"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "x-admin-username", 
    "x-admin-password", 
    "x-api-key", 
    "x-admin-panel"
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));



// MongoDB Connection for Serverless
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log(' Using existing MongoDB connection');
    return;
  }

  try {
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error(' MONGODB_URI is not defined in .env file');
    }

    console.log(' Connecting to MongoDB...');
    
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    });
    
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully!');
    console.log(' Database:', db.connections[0].name);
  } catch (err) {
    console.error(' MongoDB connection error:', err.message);
    console.error('\n Troubleshooting tips:');
    console.error('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.error('2. Verify your connection string in .env file');
    console.error('3. Check if password contains special characters (needs encoding)');
    console.error('4. Ensure MongoDB cluster is running (not paused)');
    throw err;
  }
};

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});


app.use('/api', locationRoutes);
app.use('/api', roomRoutes);
app.use('/api', flatRoutes);
app.use('/api', hostelRoutes);
app.use('/api', hotelRoomRoutes);
app.use('/api', houseRoutes);
app.use('/api', messRoutes);
app.use('/api', commercialRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/requests',requestRoutes);
app.use('/api/listing-requests',listingRequestRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/user', userRoutes);
app.use('/api', reviewRoutes);


// Export for Vercel serverless
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    
    // Connect to MongoDB for local development
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log("MongoDB connected successfully");
            app.listen(PORT, () => {
                console.log(`Server is running at port ${PORT}`);
            });
        })
        .catch((err) => console.log("MongoDB connection error:", err));
}