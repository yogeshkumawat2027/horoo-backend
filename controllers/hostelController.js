import Hostel from '../models/Hostel.js';
import State from '../models/State.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
import { uploadBase64ToCloudinary } from '../config/cloudinaryConfig.js';

// Generate slug from name
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen
};

// Generate unique slug
const generateUniqueSlug = async (baseName) => {
    let slug = generateSlug(baseName);
    let counter = 1;
    
    // Check if slug exists, if yes, append number
    while (await Hostel.findOne({ slug })) {
        slug = `${generateSlug(baseName)}-${counter}`;
        counter++;
    }
    
    return slug;
};

// Generate unique Horoo ID for hostels
const generateHorooId = async () => {
    try {
        // Find the last hostel with horooId
        const lastHostel = await Hostel.findOne({}, {}, { sort: { 'createdAt': -1 } });
        
        if (!lastHostel || !lastHostel.horooId) {
            return "HHL0001";
        }
        
        // Extract number from last horooId (e.g., HST0001 -> 1)
        const lastNumber = parseInt(lastHostel.horooId.substring(3));
        const nextNumber = lastNumber + 1;
        
        // Format with leading zeros (e.g., 1 -> 0001)
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        
        return `HHL${formattedNumber}`;
    } catch (error) {
        throw new Error("Error generating horooId");
    }
};

// Add Hostel Function
const addHostel = async (req, res) => {
    try {
        const {
            // Basic property details
            propertyName,
            horooName,
            ownerName,
            ownerMobile,
            ownerWhatsapp,
            anotherNo,
            
            // Location
            state,
            city,
            area,
            pincode,
            nearbyAreas,
            mapLink,
            latitude,
            longitude,
            realAddress,
            horooAddress,
            
            // Features
            facilities,
            ownerPrice,
            horooPrice,
            priceSuffix,
            offerType,
            pricePlans,
            
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
            messDescription,
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

        // Generate unique slug
        const slug = await generateUniqueSlug(horooName || propertyName);

        // Upload main image to Cloudinary if provided
        let mainImageUrl = null;
        if (mainImage) {
            try {
                const mainImageResult = await uploadBase64ToCloudinary(mainImage, `horoo-properties/hostels/${horooId}`);
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
                    uploadBase64ToCloudinary(image, `horoo-properties/hostels/${horooId}/gallery`)
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

        // Create new hostel
        const newHostel = new Hostel({
            horooId,
            slug,
            
            // Basic property details
            propertyName,
            horooName,
            ownerName,
            ownerMobile,
            ownerWhatsapp,
            anotherNo,
            
            // Location
            state,
            city,
            area,
            pincode,
            nearbyAreas: nearbyAreas || [],
            mapLink,
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            realAddress,
            horooAddress,
            
            // Features
            facilities: facilities || [],
            ownerPrice: Number(ownerPrice),
            horooPrice: Number(horooPrice),
            priceSuffix,
            offerType,
            pricePlans: pricePlans || [],
            
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
            messDescription,
            horooDescription
        });

        // Save hostel to database
        await newHostel.save();

        // Populate the response with location details
        await newHostel.populate([
            { path: 'state', select: 'name' },
            { path: 'city', select: 'name' },
            { path: 'area', select: 'name' }
        ]);

        res.status(201).json({
            success: true,
            message: "Hostel added successfully",
            hostel: newHostel
        });

    } catch (error) {
        console.error("Error adding hostel:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getAllHostels = async(req,res)=>{
    try{
        let Hostels = await Hostel.find();

        res.status(200).json({success : true, message : "All Hostels found",Hostels});
    }
    catch(err){
        return res.status(500).json({success: false, message : "Error to find hostels",error : err.message});
    }
}

const hostelForAdmin = async(req,res)=>{
    try{
        const {id} = req.params;
        const hostel = await Hostel.findById(id);

        if(!hostel){
            return res.status(404).json({success:false, message : "Hostel fetch error" })
        }
        res.status(200).json({success:true,message : "Hostel fetched successfully" ,hostel});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const hostelForAdminByHorooId = async(req,res)=>{
    try{
        const {horooId} = req.params;
        const hostel = await Hostel.findOne({ horooId });

        if(!hostel){
            return res.status(404).json({success:false, message : "Hostel not found" })
        }
        res.status(200).json({success:true,message : "Hostel fetched successfully" ,hostel});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const updateHostel = async(req,res)=>{
    try{
        const {id} = req.params;

        const updatedHostel = await Hostel.findByIdAndUpdate( id, { $set: req.body }, { new: true, runValidators: true })
         .populate("state")
         .populate("city")
         .populate("area");

         if(!updatedHostel){
            return res.status(404).json({success: true, message : "Update Hostel failed"});
         }
         res.status(200).json({success : true,message : "hostel Updated successfully"} ,updatedHostel);

    }
    catch(err){
        return res.status(500).json({success : false,message : "Server Error",error : err.message});
    }
}

const getHostelsForUser = async(req,res)=>{
    try {
    const hostels = await Hostel.find({ isShow: true }) // only valid hostels
      .select("horooId slug horooName horooAddress area city state ownerPrice horooPrice priceSuffix mainImage availableFor roomType averageRating totalRatings ownerWhatsapp latitude longitude") 
      .populate("state", "name") 
      .populate("city", "name")  
      .populate("area", "name"); 

    res.status(200).json({ success: true, hostels });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const getHostelDetailForUser = async(req,res)=>{
   try {
    const { slug } = req.params;
    
    // Try to find by slug first, fallback to horooId
    let hostel = await Hostel.findOne({ slug: slug })
      .select([
        "_id",
        "horooId",
        "slug",
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
        "availability",
        "isVerified",
        "mainImage",
        "otherImages",
        "youtubeLink",
        "description",
        "messDescription",
        "averageRating",
        "totalRatings",
        "reviews",
      ])
      .populate("state", "name") 
      .populate("city", "name")
      .populate("area", "name");

    // If not found by slug, try horooId
    if (!hostel) {
      hostel = await Hostel.findOne({ horooId: slug })
        .select([
          "_id",
          "horooId",
          "slug",
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
          "availability",
          "isVerified",
          "mainImage",
          "otherImages",
          "youtubeLink",
          "description",
          "messDescription",
          "averageRating",
          "totalRatings",
          "reviews",
        ])
        .populate("state", "name") 
        .populate("city", "name")
        .populate("area", "name");
    }

    if (!hostel) {
      return res.status(404).json({ success: false, message: "Hostel not found" });
    }

    // Populate reviews separately with error handling
    if (hostel && hostel.reviews && hostel.reviews.length > 0) {
      try {
        await hostel.populate({
          path: "reviews",
          match: { isActive: true, isApproved: true },
          populate: { path: "user", select: "name profilePicture" },
          options: { sort: { createdAt: -1 } }
        });
      } catch (reviewError) {
        console.error('Error populating reviews:', reviewError);
      }
    }

    res.json({ success: true, hostel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// Get Filtered Hostels
const getFilteredHostels = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
      roomType,
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
    const hostels = await Hostel.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .sort({ createdAt: -1 });

    const total = hostels.length;

    res.status(200).json({
      success: true,
      hostels,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Filtered Hostels For Users (No limitations, only public data)
const getFilteredHostelsForUser = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
      roomType,
      availableFor,
      search
    } = req.query;

    // Build filter object with user restrictions
    let filter = {
      isShow: true        // Only show hostels marked to display (main requirement)
      // Removed availability and isVerified restrictions - allow all hostels that are marked to show
    };

    // Location filters
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (area) filter.area = area;

    // Room type filter
    if (roomType) filter.roomType = { $in: [roomType] };
    
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
    const hostels = await Hostel.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .select('-ownerMobile -anotherNo -ownerName  -horooDescription -isVerified -isShow -realAddress')
      .sort({ createdAt: -1 });

    const total = hostels.length;

    res.status(200).json({
      success: true,
      hostels,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Migration function to generate slugs for existing hostels
const generateSlugsForExistingHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({ slug: { $exists: false } });
    
    let updated = 0;
    for (const hostel of hostels) {
      const slug = await generateUniqueSlug(hostel.horooName || hostel.propertyName);
      hostel.slug = slug;
      await hostel.save();
      updated++;
    }
    
    res.status(200).json({
      success: true,
      message: `Generated slugs for ${updated} hostels`,
      updated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export { addHostel, getAllHostels,hostelForAdmin,hostelForAdminByHorooId,updateHostel ,getHostelsForUser,getHostelDetailForUser,getFilteredHostels,getFilteredHostelsForUser,generateSlugsForExistingHostels};