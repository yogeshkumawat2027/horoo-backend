import express from 'express';
import masterAdminMiddleware from '../middlewares/MasterAdmin.js';
import { addFlat,getAllFlats,flatForAdmin,flatForAdminByHorooId,updateFlat,getFlatsForUser,getFlatDetailForUser,getFilteredFlats,getFilteredFlatsForUser,generateSlugsForExistingFlats,deleteAllFlats } from '../controllers/flatController.js';

const router = express.Router();

router.post('/flat', masterAdminMiddleware, addFlat);  

router.get('/flats', getAllFlats);  
router.get('/flat-for-admin/horoo/:horooId',flatForAdminByHorooId);
router.get('/flat-for-admin/:id',flatForAdmin);
router.put('/flat/edit/:id', masterAdminMiddleware, updateFlat);

router.get("/flats-for-user",getFlatsForUser);
router.get('/flats/filter', getFilteredFlats);
router.get('/flats/filter-for-user', getFilteredFlatsForUser);
router.get("/flat/:slug",getFlatDetailForUser);

router.post('/flats/generate-slugs', masterAdminMiddleware, generateSlugsForExistingFlats);

router.delete('/flats/delete-all', masterAdminMiddleware, deleteAllFlats);


export default router;
