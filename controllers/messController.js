import Mess from '../models/Mess.js';
import State from '../models/State.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
import { uploadBase64ToCloudinary } from '../config/cloudinaryConfig.js';

// Generate unique Horoo ID for mess
const generateHorooId = async () => {
    try {
        // Find the last mess with horooId
        const lastMess = await Mess.findOne({}, {}, { sort: { 'createdAt': -1 } });
        
        if (!lastMess || !lastMess.horooId) {
            return "MES0001";
        }
        
        // Extract number from last horooId (e.g., MES0001 -> 1)
        const lastNumber = parseInt(lastMess.horooId.substring(3));
        const nextNumber = lastNumber + 1;
        
        // Format with leading zeros (e.g., 1 -> 0001)
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        
        return `MES${formattedNumber}`;
    } catch (error) {
        throw new Error("Error generating horooId");
    }
};

// Add Mess Function
const addMess = async (req, res) => {
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
            
            // Availability & Options
            availableFor,
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
                const mainImageResult = await uploadBase64ToCloudinary(mainImage, `horoo-properties/mess/${horooId}`);
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
                    uploadBase64ToCloudinary(image, `horoo-properties/mess/${horooId}/gallery`)
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

        // Create new mess
        const newMess = new Mess({
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
            
            // Availability & Options
            availableFor: availableFor || [],
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

        // Save mess to database
        await newMess.save();

        // Populate the response with location details
        await newMess.populate([
            { path: 'state', select: 'name' },
            { path: 'city', select: 'name' },
            { path: 'area', select: 'name' }
        ]);

        res.status(201).json({
            success: true,
            message: "Mess added successfully",
            mess: newMess
        });

    } catch (error) {
        console.error("Error adding mess:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getAllMess = async(req,res)=>{
    try{
        let mess = await Mess.find();

        res.status(200).json({success : true, message : "All Mess found",mess});
    }
    catch(err){
        return res.status(500).json({success: false, message : "Error to find mess",error : err.message});
    }
}

const messForAdmin = async(req,res)=>{
    try{
        const {id} = req.params;
        const mess = await Mess.findById(id);

        if(!mess){
            return res.status(404).json({success:false, message : "Mess fetch error" })
        }
        res.status(200).json({success:true,message : "Mess fetched successfully" ,mess});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const updateMess = async(req,res)=>{
    try{
        const {id} = req.params;

        const updatedMess = await Mess.findByIdAndUpdate( id, { $set: req.body }, { new: true, runValidators: true })
         .populate("state")
         .populate("city")
         .populate("area");

         if(!updatedMess){
            return res.status(404).json({success: true, message : "Update Mess failed"});
         }
         res.status(200).json({success : true,message : "Mess Updated successfully"} ,updatedMess);

    }
    catch(err){
        return res.status(500).json({success : false,message : "Server Error",error : err.message});
    }
}

const getMessForUser = async(req,res)=>{
    try {
    const mess = await Mess.find({ isShow: true }) // only valid mess
      .select("horooId horooAddress area city state ownerPrice horooPrice mainImage availableFor") 
      .populate("state", "name") 
      .populate("city", "name")  
      .populate("area", "name"); 

    res.status(200).json({ success: true, mess });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const getMessDetailForUser = async(req,res)=>{
   try {
    const { id } = req.params;
    const mess = await Mess.findById(id)
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

    if (!mess) {
      return res.status(404).json({ success: false, message: "Mess not found" });
    }

    res.json({ success: true, mess });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// Get Filtered Mess
const getFilteredMess = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
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
    const mess = await Mess.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .sort({ createdAt: -1 });

    const total = mess.length;

    res.status(200).json({
      success: true,
      mess,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Filtered Mess For Users (No limitations, only public data)
const getFilteredMessForUser = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
      availableFor,
      search
    } = req.query;

    // Build filter object with user restrictions
    let filter = {
      isShow: true        // Only show mess marked to display (main requirement)
      // Removed availability and isVerified restrictions - allow all mess that are marked to show
    };

    // Location filters
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (area) filter.area = area;
    
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
    const mess = await Mess.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .select('-ownerMobile -anotherNo -ownerName -ownerPrice -horooDescription -isVerified -isShow -realAddress')
      .sort({ createdAt: -1 });

    const total = mess.length;

    res.status(200).json({
      success: true,
      mess,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export { addMess, getAllMess, messForAdmin, updateMess, getMessForUser, getMessDetailForUser, getFilteredMess, getFilteredMessForUser };