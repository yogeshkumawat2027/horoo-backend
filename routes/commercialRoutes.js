import express from 'express';
import { addCommercial, getAllCommercials, commercialForAdmin, commercialForAdminByHorooId, updateCommercial, getCommercialsForUser, getCommercialDetailForUser, getFilteredCommercials, getFilteredCommercialsForUser } from '../controllers/commercialController.js';

const router = express.Router();

// Admin routes
router.post('/commercial', addCommercial);
router.get('/commercial', getAllCommercials); 
router.get('/commercial-for-admin/horoo/:horooId', commercialForAdminByHorooId); //show detail commercial for admin by horooId
router.get('/commercial-for-admin/:id', commercialForAdmin);
router.put('/commercial/edit/:id', updateCommercial);
router.get('/commercial/filter', getFilteredCommercials);

// User routes
router.get('/commercial-for-user', getCommercialsForUser);
router.get('/commercial/filter-for-user', getFilteredCommercialsForUser);
router.get('/commercial/:id', getCommercialDetailForUser);

export default router;
