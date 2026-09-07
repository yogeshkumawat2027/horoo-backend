import express from 'express';
import masterAdminMiddleware from '../middlewares/MasterAdmin.js';
import { addCommercial, getAllCommercials, commercialForAdmin, commercialForAdminByHorooId, updateCommercial, getCommercialsForUser, getCommercialDetailForUser, getFilteredCommercials, getFilteredCommercialsForUser, generateSlugsForExistingCommercials } from '../controllers/commercialController.js';

const router = express.Router();

router.post('/commercial', masterAdminMiddleware, addCommercial);
router.get('/commercial', getAllCommercials); 
router.get('/commercial-for-admin/horoo/:horooId', commercialForAdminByHorooId);
router.get('/commercial-for-admin/:id', commercialForAdmin);
router.put('/commercial/edit/:id', masterAdminMiddleware, updateCommercial);
router.get('/commercial/filter', getFilteredCommercials);

router.get('/commercial-for-user', getCommercialsForUser);
router.get('/commercial/filter-for-user', getFilteredCommercialsForUser);
router.get('/commercial/:slug', getCommercialDetailForUser);

router.post('/commercial/generate-slugs', masterAdminMiddleware, generateSlugsForExistingCommercials);

export default router;
