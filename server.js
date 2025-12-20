import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from './config/passport.js';
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

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'horoo_session_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());



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



const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("Mongodb connected successfully");
})
.catch((err)=> console.log(err));

// export default app;

app.listen(PORT,()=>{
    console.log("Server is running at port 5000");
})