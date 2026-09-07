import express from 'express';
import masterAdminMiddleware from '../middlewares/MasterAdmin.js';
import { addHotelRoom, getAllHotelRooms, hotelRoomForAdmin, hotelRoomForAdminByHorooId, updateHotelRoom, getHotelRoomsForUser, getHotelRoomDetailForUser, getFilteredHotelRooms, getFilteredHotelRoomsForUser, generateSlugsForExistingHotelRooms } from '../controllers/hotelRoomController.js';

const router = express.Router();

router.post('/hotel', masterAdminMiddleware, addHotelRoom);
router.get('/hotel', getAllHotelRooms); 
router.get('/hotel-for-admin/horoo/:horooId', hotelRoomForAdminByHorooId);
router.get('/hotel-for-admin/:id', hotelRoomForAdmin);
router.put('/hotel/edit/:id', masterAdminMiddleware, updateHotelRoom);
router.get('/hotel/filter', getFilteredHotelRooms);

router.get('/hotel-for-user', getHotelRoomsForUser);
router.get('/hotel/filter-for-user', getFilteredHotelRoomsForUser);
router.get('/hotel/:slug', getHotelRoomDetailForUser);

router.post('/hotel/generate-slugs', masterAdminMiddleware, generateSlugsForExistingHotelRooms);

export default router;
