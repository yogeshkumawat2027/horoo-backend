import express from 'express';
import { addHostel,getAllHostels,hostelForAdmin,hostelForAdminByHorooId,updateHostel,getHostelsForUser,getHostelDetailForUser,getFilteredHostels,getFilteredHostelsForUser,generateSlugsForExistingHostels } from '../controllers/hostelController.js';

const router = express.Router();

// POST /api/hostel - Add new hostel
router.post('/hostel', addHostel);  

router.get('/hostels', getAllHostels);  
router.get('/hostel-for-admin/horoo/:horooId',hostelForAdminByHorooId);  //show detail hostels for admin by horooId
router.get('/hostel-for-admin/:id',hostelForAdmin);  //show detail hostels for admin
router.put('/hostel/edit/:id',updateHostel);

router.get("/hostels-for-user",getHostelsForUser);
router.get('/hostels/filter', getFilteredHostels); // Filter hostels with multiple criteria - Admin
router.get('/hostels/filter-for-user', getFilteredHostelsForUser); // Filter hostels for users - Public
router.get("/hostel/:slug",getHostelDetailForUser); //show details of hostels to user

// Migration route
router.post('/hostel/generate-slugs', generateSlugsForExistingHostels);

export default router;
