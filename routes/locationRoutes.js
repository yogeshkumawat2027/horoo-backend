import express from 'express'

import {addArea, addCity, addState, getCitiesByState,getAreasByCities, getState,getCities,getAreas,getLocationDetails} from '../controllers/locationController.js'

const router = express.Router();

router.post('/state',addState);
router.post("/city", addCity);
router.post('/area', addArea);

router.get("/states",getState);
router.get("/cities/:id",getCitiesByState);
router.get("/areas/:id",getAreasByCities);
router.get("/cities",getCities);
router.get("/areas",getAreas);

router.get("/location-details",getLocationDetails);


export default router;