import Flat from '../models/Flat.js';
import State from '../models/State.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
import { uploadBase64ToCloudinary } from '../config/cloudinaryConfig.js';

// Generate unique Horoo ID for flats
const generateHorooId = async () => {
    try {
        // Find the last flat with horooId
        const lastFlat = await Flat.findOne({}, {}, { sort: { 'createdAt': -1 } });
        
        if (!lastFlat || !lastFlat.horooId) {
            return "HFT0001";
        }
        
        // Extract number from last horooId (e.g., FLT0001 -> 1)
        const lastNumber = parseInt(lastFlat.horooId.substring(3));
        const nextNumber = lastNumber + 1;
        
        // Format with leading zeros (e.g., 1 -> 0001)
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        
        return `HFT${formattedNumber}`;
    } catch (error) {
        throw new Error("Error generating horooId");
    }
};

// Add Flat Function
const addFlat = async (req, res) => {
    try {
        const {
            // Basic property details
            propertyName,
            horooName,
            ownerName,
            ownerMobile,
            anotherNo,
            
            // Location
            state,
            city,
            area,
            pincode,
            nearbyAreas,
            mapLink,
            realAddress,
            horooAddress,
            
            // Features
            facilities,
            ownerPrice,
            horooPrice,
            offerType,
            pricePlans,
            flatType,
            
            // Availability & Options
            availableFor,
            roomSize,
            roomType,
            quantity,
            availability,
            isVerified,
            isShow,
            
            // Media (base64 strings)
            mainImage,
            otherImages,
            youtubeLink,
            
            // Descriptions
            description,
            horooDescription
        } = req.body;

        // Validation for required fields
        if (!propertyName || !horooName || !ownerName || !ownerMobile || !state || !city || !area || !pincode || !ownerPrice || !horooPrice) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            });
        }

        // Verify state, city, and area exist
        const stateExists = await State.findById(state);
        if (!stateExists) {
            return res.status(404).json({
                success: false,
                message: "State not found"
            });
        }

        const cityExists = await City.findById(city);
        if (!cityExists) {
            return res.status(404).json({
                success: false,
                message: "City not found"
            });
        }

        const areaExists = await Area.findById(area);
        if (!areaExists) {
            return res.status(404).json({
                success: false,
                message: "Area not found"
            });
        }

        // Generate unique Horoo ID
        const horooId = await generateHorooId();

        // Upload main image to Cloudinary if provided
        let mainImageUrl = null;
        if (mainImage) {
            try {
                const mainImageResult = await uploadBase64ToCloudinary(mainImage, `horoo-properties/flats/${horooId}`);
                mainImageUrl = mainImageResult.secure_url;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload main image",
                    error: error.message
                });
            }
        }

        // Upload other images to Cloudinary if provided
        let otherImageUrls = [];
        if (otherImages && Array.isArray(otherImages)) {
            try {
                const uploadPromises = otherImages.map((image, index) => 
                    uploadBase64ToCloudinary(image, `horoo-properties/flats/${horooId}/gallery`)
                );
                const uploadResults = await Promise.all(uploadPromises);
                otherImageUrls = uploadResults.map(result => result.secure_url);
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload other images",
                    error: error.message
                });
            }
        }

        // Create new flat
        const newFlat = new Flat({
            horooId,
            
            // Basic property details
            propertyName,
            horooName,
            ownerName,
            ownerMobile,
            anotherNo,
            
            // Location
            state,
            city,
            area,
            pincode,
            nearbyAreas: nearbyAreas || [],
            mapLink,
            realAddress,
            horooAddress,
            
            // Features
            facilities: facilities || [],
            ownerPrice: Number(ownerPrice),
            horooPrice: Number(horooPrice),
            offerType,
            pricePlans: pricePlans || [],
            flatType: flatType || [],
            
            // Availability & Options
            availableFor: availableFor || [],
            roomSize,
            roomType: roomType || [],
            quantity: quantity || 1,
            availability: availability !== undefined ? availability : true,
            isVerified: isVerified !== undefined ? isVerified : true,
            isShow: isShow !== undefined ? isShow : false,
            
            // Media
            mainImage: mainImageUrl,
            otherImages: otherImageUrls,
            youtubeLink,
            
            // Descriptions
            description,
            horooDescription
        });

        // Save flat to database
        await newFlat.save();

        // Populate the response with location details
        await newFlat.populate([
            { path: 'state', select: 'name' },
            { path: 'city', select: 'name' },
            { path: 'area', select: 'name' }
        ]);

        res.status(201).json({
            success: true,
            message: "Flat added successfully",
            flat: newFlat
        });

    } catch (error) {
        console.error("Error adding flat:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getAllFlats = async(req,res)=>{
    try{
        let Flats = await Flat.find();

        res.status(200).json({success : true, message : "All Flats found",Flats});
    }
    catch(err){
        return res.status(500).json({success: false, message : "Error to find flats",error : err.message});
    }
}

const flatForAdmin = async(req,res)=>{
    try{
        const {id} = req.params;
        const flat = await Flat.findById(id);

        if(!flat){
            return res.status(404).json({success:false, message : "Flat fetch error" })
        }
        res.status(200).json({success:true,message : "Flat fetched successfully" ,flat});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const flatForAdminByHorooId = async(req,res)=>{
    try{
        const {horooId} = req.params;
        const flat = await Flat.findOne({ horooId });

        if(!flat){
            return res.status(404).json({success:false, message : "Flat not found" })
        }
        res.status(200).json({success:true,message : "Flat fetched successfully" ,flat});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const updateFlat = async(req,res)=>{
    try{
        const {id} = req.params;

        const updatedFlat = await Flat.findByIdAndUpdate( id, { $set: req.body }, { new: true, runValidators: true })
         .populate("state")
         .populate("city")
         .populate("area");

         if(!updatedFlat){
            return res.status(404).json({success: true, message : "Update Flat failed"});
         }
         res.status(200).json({success : true,message : "flat Updated successfully"} ,updatedFlat);

    }
    catch(err){
        return res.status(500).json({success : false,message : "Server Error",error : err.message});
    }
}

const getFlatsForUser = async(req,res)=>{
    try {
    const flats = await Flat.find({ isShow: true }) // only valid flats
      .select("horooId horooAddress horooName area city state ownerPrice horooPrice mainImage availableFor roomType flatType") 
      .populate("state", "name") 
      .populate("city", "name")  
      .populate("area", "name"); 

    res.status(200).json({ success: true, flats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const getFlatDetailForUser = async(req,res)=>{
   try {
    const { id } = req.params;
    const flat = await Flat.findOne({ horooId: id })
      .select([
        "horooId",
        "horooName",
        "state",
        "city",
        "area",
        "pincode",
        "nearbyAreas",
        "mapLink",
        "horooAddress",
        "facilities",
        "ownerPrice",
        "horooPrice",
        "pricePlans",
        "availableFor",
        "roomSize",
        "roomType",
        "flatType",
        "availability",
        "isVerified",
        "mainImage",
        "otherImages",
        "youtubeLink",
        "description",
      ])
      .populate("state", "name") 
      .populate("city", "name")
      .populate("area", "name");

    if (!flat) {
      return res.status(404).json({ success: false, message: "Flat not found" });
    }

    res.json({ success: true, flat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// Get Filtered Flats
const getFilteredFlats = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
      roomType,
      flatType,
      availableFor,
      availability,
      isVerified,
      isShow,
      search
    } = req.query;

    // Build filter object
    let filter = {};

    // Location filters
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (area) filter.area = area;

    // Room type filter
    if (roomType) filter.roomType = { $in: [roomType] };
    
    // Flat type filter
    if (flatType) filter.flatType = { $in: [flatType] };
    
    // Available for filter
    if (availableFor) filter.availableFor = { $in: [availableFor] };

    // Boolean filters
    if (availability !== undefined) filter.availability = availability === 'true';
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (isShow !== undefined) filter.isShow = isShow === 'true';

    // Search filter (multiple fields)
    if (search) {
      filter.$or = [
        { horooId: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { ownerMobile: { $regex: search, $options: 'i' } },
        { pincode: { $regex: search, $options: 'i' } },
        { propertyName: { $regex: search, $options: 'i' } },
        { horooName: { $regex: search, $options: 'i' } },
        { nearbyAreas: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query without pagination
    const flats = await Flat.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .sort({ createdAt: -1 });

    const total = flats.length;

    res.status(200).json({
      success: true,
      flats,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Filtered Flats For Users (No limitations, only public data)
const getFilteredFlatsForUser = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
      roomType,
      flatType,
      availableFor,
      search
    } = req.query;

    // Build filter object with user restrictions
    let filter = {
      isShow: true        // Only show flats marked to display (main requirement)
      // Removed availability and isVerified restrictions - allow all flats that are marked to show
    };

    // Location filters
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (area) filter.area = area;

    // Room type filter
    if (roomType) filter.roomType = { $in: [roomType] };
    
    // Flat type filter
    if (flatType) filter.flatType = { $in: [flatType] };
    
    // Available for filter
    if (availableFor) filter.availableFor = { $in: [availableFor] };

    // Search filter (all fields allowed - no limitations)
    if (search) {
      filter.$or = [
        { horooId: { $regex: search, $options: 'i' } },
        { propertyName: { $regex: search, $options: 'i' } },
        { horooName: { $regex: search, $options: 'i' } },
        { nearbyAreas: { $in: [new RegExp(search, 'i')] } },
        { pincode: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query and exclude sensitive fields
    const flats = await Flat.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .select('-ownerMobile -anotherNo -ownerName -horooDescription -isVerified -isShow -realAddress')
      .sort({ createdAt: -1 });

    const total = flats.length;

    res.status(200).json({
      success: true,
      flats,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export { addFlat, getAllFlats,flatForAdmin,flatForAdminByHorooId,updateFlat ,getFlatsForUser,getFlatDetailForUser,getFilteredFlats,getFilteredFlatsForUser};