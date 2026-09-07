import express from 'express';
import masterAdminMiddleware from '../middlewares/MasterAdmin.js';
import { addMess, getAllMess, messForAdmin, messForAdminByHorooId, updateMess, getMessForUser, getMessDetailForUser, getFilteredMess, getFilteredMessForUser } from '../controllers/messController.js';

const router = express.Router();

router.post('/mess', masterAdminMiddleware, addMess);
router.get('/mess', getAllMess); 
router.get('/mess-for-admin/horoo/:horooId', messForAdminByHorooId);
router.get('/mess-for-admin/:id', messForAdmin);
router.put('/mess/edit/:id', masterAdminMiddleware, updateMess);
router.get('/mess/filter', getFilteredMess);

router.get('/mess-for-user', getMessForUser);
router.get('/mess/filter-for-user', getFilteredMessForUser);
router.get('/mess/:id', getMessDetailForUser);

export default router;
