import express from 'express';
import { addHostel,getAllHostels,hostelForAdmin,updateHostel,getHostelsForUser,getHostelDetailForUser,getFilteredHostels,getFilteredHostelsForUser } from '../controllers/hostelController.js';

const router = express.Router();

// POST /api/hostel - Add new hostel
router.post('/hostel', addHostel);  

router.get('/hostels', getAllHostels);  
router.get('/hostel-for-admin/:id',hostelForAdmin);  //show detail hostels for admin
router.put('/hostel/edit/:id',updateHostel);

router.get("/hostels-for-user",getHostelsForUser);
router.get("/hostel/:id",getHostelDetailForUser); //show details of hostels to user
router.get('/hostels/filter', getFilteredHostels); // Filter hostels with multiple criteria - Admin
router.get('/hostels/filter-for-user', getFilteredHostelsForUser); // Filter hostels for users - Public


export default router;
