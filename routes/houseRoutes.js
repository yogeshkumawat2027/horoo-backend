import express from 'express';
import { addHouse, getAllHouses, houseForAdmin, houseForAdminByHorooId, updateHouse, getHousesForUser, getHouseDetailForUser, getFilteredHouses, getFilteredHousesForUser } from '../controllers/houseController.js';

const router = express.Router();

// Admin routes
router.post('/house', addHouse);
router.get('/house', getAllHouses); 
router.get('/house-for-admin/horoo/:horooId', houseForAdminByHorooId); //show detail house for admin by horooId
router.get('/house-for-admin/:id', houseForAdmin);
router.put('/house/edit/:id', updateHouse);
router.get('/house/filter', getFilteredHouses);

// User routes
router.get('/house-for-user', getHousesForUser);
router.get('/house/filter-for-user', getFilteredHousesForUser);
router.get('/house/:id', getHouseDetailForUser);

export default router;
