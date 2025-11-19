import express from "express";
import {
  addListingRequest,
  getAllListingRequests,
  updateListingRequest,
  filterListingRequests,
  searchListingRequests
} from "../controllers/listingRequestController.js";

const router = express.Router();

// Specific routes first
router.get("/search", searchListingRequests);
router.get("/filter", filterListingRequests);

// Generic routes
router.get("/", getAllListingRequests);
router.post("/", addListingRequest);
router.put("/update/:id", updateListingRequest);

export default router;
