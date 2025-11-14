import express from "express";
import  {addRequest ,getAllRequests , updateRequest ,filterRequests , searchRequests } from "../controllers/requestController.js";


const router = express.Router();

// Specific routes first
router.get("/search", searchRequests);

// Generic routes
router.get("/", getAllRequests);
router.post("/", addRequest);
router.put("/update/:id", updateRequest);

export default router;