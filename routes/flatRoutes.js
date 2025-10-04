import express from 'express';
import { addFlat,getAllFlats,flatForAdmin,updateFlat,getFlatsForUser,getFlatDetailForUser,getFilteredFlats,getFilteredFlatsForUser } from '../controllers/flatController.js';

const router = express.Router();

// POST /api/flat - Add new flat
router.post('/flat', addFlat);  

router.get('/flats', getAllFlats);  
router.get('/flat-for-admin/:id',flatForAdmin);  //show detail flats for admin
router.put('/flat/edit/:id',updateFlat);

router.get("/flats-for-user",getFlatsForUser);
router.get("/flat/:id",getFlatDetailForUser); //show details of flats to user
router.get('/flats/filter', getFilteredFlats); // Filter flats with multiple criteria - Admin
router.get('/flats/filter-for-user', getFilteredFlatsForUser); // Filter flats for users - Public


export default router;
