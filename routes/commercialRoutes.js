import express from 'express';
import { addCommercial, getAllCommercials, commercialForAdmin, updateCommercial, getCommercialsForUser, getCommercialDetailForUser, getFilteredCommercials, getFilteredCommercialsForUser } from '../controllers/commercialController.js';

const router = express.Router();

// Admin routes
router.post('/commercial', addCommercial);
router.get('/commercial', getAllCommercials); 
router.get('/commercial-for-admin/:id', commercialForAdmin);
router.put('/commercial/edit/:id', updateCommercial);
router.get('/commercial/filter', getFilteredCommercials);

// User routes
router.get('/commercial-for-user', getCommercialsForUser);
router.get('/commercial/:id', getCommercialDetailForUser);
router.get('/commercial/filter-for-user', getFilteredCommercialsForUser);

export default router;
