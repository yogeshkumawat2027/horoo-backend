import express from 'express';
import masterAdminMiddleware from '../middlewares/MasterAdmin.js';
import { addHouse, getAllHouses, houseForAdmin, houseForAdminByHorooId, updateHouse, getHousesForUser, getHouseDetailForUser, getFilteredHouses, getFilteredHousesForUser, generateSlugsForExistingHouses } from '../controllers/houseController.js';

const router = express.Router();

router.post('/house', masterAdminMiddleware, addHouse);
router.get('/house', getAllHouses); 
router.get('/house-for-admin/horoo/:horooId', houseForAdminByHorooId);
router.get('/house-for-admin/:id', houseForAdmin);
router.put('/house/edit/:id', masterAdminMiddleware, updateHouse);
router.get('/house/filter', getFilteredHouses);

router.get('/house-for-user', getHousesForUser);
router.get('/house/filter-for-user', getFilteredHousesForUser);
router.get('/house/:slug', getHouseDetailForUser);

router.post('/house/generate-slugs', masterAdminMiddleware, generateSlugsForExistingHouses);

export default router;
