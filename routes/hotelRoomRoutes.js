import express from 'express';
import { addHotelRoom, getAllHotelRooms, hotelRoomForAdmin, updateHotelRoom, getHotelRoomsForUser, getHotelRoomDetailForUser, getFilteredHotelRooms, getFilteredHotelRoomsForUser } from '../controllers/hotelRoomController.js';

const router = express.Router();

// Admin routes
router.post('/hotel', addHotelRoom);
router.get('/hotel', getAllHotelRooms); 
router.get('/hotel-for-admin/:id', hotelRoomForAdmin);
router.put('/hotel/edit/:id', updateHotelRoom);
router.get('/hotel/filter', getFilteredHotelRooms);

// User routes
router.get('/hotel-for-user', getHotelRoomsForUser);
router.get('/hotel/:id', getHotelRoomDetailForUser);
router.get('/hotel/filter-for-user', getFilteredHotelRoomsForUser);

export default router;
