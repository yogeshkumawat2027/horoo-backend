import express from 'express';
import masterAdminMiddleware from '../middlewares/MasterAdmin.js';
import { addHostel,getAllHostels,hostelForAdmin,hostelForAdminByHorooId,updateHostel,getHostelsForUser,getHostelDetailForUser,getFilteredHostels,getFilteredHostelsForUser,generateSlugsForExistingHostels } from '../controllers/hostelController.js';

const router = express.Router();

router.post('/hostel', masterAdminMiddleware, addHostel);  

router.get('/hostels', getAllHostels);  
router.get('/hostel-for-admin/horoo/:horooId',hostelForAdminByHorooId);
router.get('/hostel-for-admin/:id',hostelForAdmin);
router.put('/hostel/edit/:id', masterAdminMiddleware, updateHostel);

router.get("/hostels-for-user",getHostelsForUser);
router.get('/hostels/filter', getFilteredHostels);
router.get('/hostels/filter-for-user', getFilteredHostelsForUser);
router.get("/hostel/:slug",getHostelDetailForUser);

router.post('/hostel/generate-slugs', masterAdminMiddleware, generateSlugsForExistingHostels);

export default router;
