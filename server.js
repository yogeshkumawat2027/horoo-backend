import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'
import locationRoutes from './routes/locationRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import flatRoutes from './routes/flatRoutes.js';
import hostelRoutes from './routes/hostelRoutes.js';
import hotelRoomRoutes from './routes/hotelRoomRoutes.js';
import houseRoutes from './routes/houseRoutes.js';
import messRoutes from './routes/messRoutes.js';
import commercialRoutes from './routes/commercialRoutes.js';

import dotenv from 'dotenv';
dotenv.config();
const app = express();


//middleware 
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:3000",
      "https://horoo.in",
      "https://www.horoo.in",
      "http://horoo.in",
      "http://www.horoo.in"
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "x-admin-username", 
    "x-admin-password", 
    "x-api-key", 
    "x-admin-panel"
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-username, x-admin-password, x-api-key, x-admin-panel');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Horoo Backend API is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Health Check Passed',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', locationRoutes);
app.use('/api', roomRoutes);
app.use('/api', flatRoutes);
app.use('/api', hostelRoutes);
app.use('/api/hotelroom', hotelRoomRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/commercials', commercialRoutes);



const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("Mongodb connected successfully");
})
.catch((err)=> console.log(err));

app.listen(PORT,()=>{
    console.log("Server is running at port 5000");
})