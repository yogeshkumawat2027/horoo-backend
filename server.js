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
  origin: [
    "http://localhost:3000", // Local development
    "https://horoo.in", // Production domain
    "https://www.horoo.in", // WWW version
    "http://horoo.in", // HTTP version
    "http://www.horoo.in" // HTTP WWW version
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