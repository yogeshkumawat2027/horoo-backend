import express from 'express';
import { addRoom,getAllRooms,roomForAdmin,updateRoom,getRoomsForUser,getRoomDeatilForUser,getFilteredRooms,getFilteredRoomsForUser } from '../controllers/roomController.js';

const router = express.Router();

// POST /api/room - Add new room
router.post('/room', addRoom);  

router.get('/rooms', getAllRooms);  
router.get('/room-for-admin/:id',roomForAdmin);  //show detail rooms  for admin
router.put('/room/edit/:id',updateRoom);

router.get("/rooms-for-user",getRoomsForUser);
router.get("/room/:id",getRoomDeatilForUser); //show details of rooms to user
router.get('/rooms/filter', getFilteredRooms); // Filter rooms with multiple criteria - Admin
router.get('/rooms/filter-for-user', getFilteredRoomsForUser); // Filter rooms for users - Public


export default router;