import express from 'express';
import { addRoom,getAllRooms,roomForAdmin,roomForAdminByHorooId,updateRoom,getRoomsForUser,getRoomDeatilForUser,getFilteredRooms,getFilteredRoomsForUser,generateSlugsForExistingRooms } from '../controllers/roomController.js';

const router = express.Router();

// POST /api/room - Add new room
router.post('/room', addRoom);  

router.get('/rooms', getAllRooms);  
router.get('/room-for-admin/horoo/:horooId',roomForAdminByHorooId);  //show detail rooms for admin by horooId
router.get('/room-for-admin/:id',roomForAdmin);  //show detail rooms  for admin
router.put('/room/edit/:id',updateRoom);
router.get("/rooms-for-user",getRoomsForUser);
router.get('/rooms/filter', getFilteredRooms); // Filter rooms with multiple criteria - Admin
router.get('/rooms/filter-for-user', getFilteredRoomsForUser); // Filter rooms for users - Public
router.get("/room/:slug",getRoomDeatilForUser); //show details of rooms to user by slug

// Migration route - Generate slugs for existing rooms (call once)
router.post('/rooms/generate-slugs', generateSlugsForExistingRooms); // Admin utility



export default router;