import express from 'express';
import { addHotelRoom, getAllHotelRooms, hotelRoomForAdmin, hotelRoomForAdminByHorooId, updateHotelRoom, getHotelRoomsForUser, getHotelRoomDetailForUser, getFilteredHotelRooms, getFilteredHotelRoomsForUser, generateSlugsForExistingHotelRooms } from '../controllers/hotelRoomController.js';

const router = express.Router();

// Admin routes
router.post('/hotel', addHotelRoom);
router.get('/hotel', getAllHotelRooms); 
router.get('/hotel-for-admin/horoo/:horooId', hotelRoomForAdminByHorooId); //show detail hotel for admin by horooId
router.get('/hotel-for-admin/:id', hotelRoomForAdmin);
router.put('/hotel/edit/:id', updateHotelRoom);
router.get('/hotel/filter', getFilteredHotelRooms);

// User routes
router.get('/hotel-for-user', getHotelRoomsForUser);
router.get('/hotel/filter-for-user', getFilteredHotelRoomsForUser);
router.get('/hotel/:slug', getHotelRoomDetailForUser);

// Migration route
router.post('/hotel/generate-slugs', generateSlugsForExistingHotelRooms);

export default router;
