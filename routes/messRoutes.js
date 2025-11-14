import express from 'express';
import { addMess, getAllMess, messForAdmin, messForAdminByHorooId, updateMess, getMessForUser, getMessDetailForUser, getFilteredMess, getFilteredMessForUser } from '../controllers/messController.js';

const router = express.Router();

// Admin routes
router.post('/mess', addMess);
router.get('/mess', getAllMess); 
router.get('/mess-for-admin/horoo/:horooId', messForAdminByHorooId); //show detail mess for admin by horooId
router.get('/mess-for-admin/:id', messForAdmin);
router.put('/mess/edit/:id', updateMess);
router.get('/mess/filter', getFilteredMess);

// User routes
router.get('/mess-for-user', getMessForUser);
router.get('/mess/filter-for-user', getFilteredMessForUser);
router.get('/mess/:id', getMessDetailForUser);

export default router;
