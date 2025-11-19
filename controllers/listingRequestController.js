import ListingRequest from "../models/ListingRequest.js";

// Add new listing request
const addListingRequest = async (req, res) => {
  try {
    const { name, mobile, address, propertyType } = req.body;

    const newListingRequest = await ListingRequest.create({
      name,
      mobile,
      address,
      propertyType,
      status: "new"
    });

    res.status(201).json({
      success: true,
      message: "Listing request added successfully",
      data: newListingRequest
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Adding listing request failed. Error: ${err.message}`
    });
  }
};

// Get all listing requests
const getAllListingRequests = async (req, res) => {
  try {
    const requests = await ListingRequest.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch listing requests",
      error: error.message
    });
  }
};

// Update listing request
const updateListingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updated = await ListingRequest.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Listing request not found"
      });
    }

    res.json({
      success: true,
      message: "Listing request updated",
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Updating listing request failed. Error: ${err.message}`
    });
  }
};

// Filter listing requests
const filterListingRequests = async (req, res) => {
  try {
    const { status, propertyType } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (propertyType) filter.propertyType = propertyType;

    const requests = await ListingRequest.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Search listing requests
const searchListingRequests = async (req, res) => {
  try {
    const { query } = req.query;

    const results = await ListingRequest.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { mobile: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } }
      ]
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export {
  addListingRequest,
  getAllListingRequests,
  updateListingRequest,
  filterListingRequests,
  searchListingRequests
};