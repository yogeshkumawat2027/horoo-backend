import express from 'express';
import masterAdminMiddleware from '../middlewares/MasterAdmin.js';
import { addRoom,getAllRooms,roomForAdmin,roomForAdminByHorooId,updateRoom,getRoomsForUser,getRoomDeatilForUser,getFilteredRooms,getFilteredRoomsForUser,generateSlugsForExistingRooms } from '../controllers/roomController.js';

const router = express.Router();

router.post('/room', masterAdminMiddleware, addRoom);  

router.get('/rooms', getAllRooms);  
router.get('/room-for-admin/horoo/:horooId',roomForAdminByHorooId);
router.get('/room-for-admin/:id',roomForAdmin);
router.put('/room/edit/:id', masterAdminMiddleware, updateRoom);
router.get("/rooms-for-user",getRoomsForUser);
router.get('/rooms/filter', getFilteredRooms);
router.get('/rooms/filter-for-user', getFilteredRoomsForUser);
router.get("/room/:slug",getRoomDeatilForUser);

router.post('/rooms/generate-slugs', masterAdminMiddleware, generateSlugsForExistingRooms);



export default router;