import Commercial from '../models/Commercial.js';
import State from '../models/State.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
import { uploadBase64ToCloudinary } from '../config/cloudinaryConfig.js';

// Generate slug from horooName
const generateSlug = (horooName) => {
    return horooName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

// Generate unique slug
const generateUniqueSlug = async (horooName) => {
    let slug = generateSlug(horooName);
    let counter = 1;
    
    // Check if slug exists
    while (await Commercial.findOne({ slug })) {
        slug = `${generateSlug(horooName)}-${counter}`;
        counter++;
    }
    
    return slug;
};

// Generate unique Horoo ID for commercial properties
const generateHorooId = async () => {
    try {
        // Find the last commercial property with horooId
        const lastCommercial = await Commercial.findOne({}, {}, { sort: { 'createdAt': -1 } });
        
        if (!lastCommercial || !lastCommercial.horooId) {
            return "HCL0001";
        }
        
        // Extract number from last horooId (e.g., COM0001 -> 1)
        const lastNumber = parseInt(lastCommercial.horooId.substring(3));
        const nextNumber = lastNumber + 1;
        
        // Format with leading zeros (e.g., 1 -> 0001)
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        
        return `HCL${formattedNumber}`;
    } catch (error) {
        throw new Error("Error generating horooId");
    }
};

// Add Commercial Property Function
const addCommercial = async (req, res) => {
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
            commercialSize,
            commercialType,
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
        const slug = await generateUniqueSlug(horooName);

        // Upload main image to Cloudinary if provided
        let mainImageUrl = null;
        if (mainImage) {
            try {
                const mainImageResult = await uploadBase64ToCloudinary(mainImage, `horoo-properties/commercial/${horooId}`);
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
                    uploadBase64ToCloudinary(image, `horoo-properties/commercial/${horooId}/gallery`)
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

        // Create new commercial property
        const newCommercial = new Commercial({
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
            commercialSize,
            commercialType: commercialType || [],
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

        // Save commercial property to database
        await newCommercial.save();

        // Populate the response with location details
        await newCommercial.populate([
            { path: 'state', select: 'name' },
            { path: 'city', select: 'name' },
            { path: 'area', select: 'name' }
        ]);

        res.status(201).json({
            success: true,
            message: "Commercial property added successfully",
            commercial: newCommercial
        });

    } catch (error) {
        console.error("Error adding commercial property:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getAllCommercials = async(req,res)=>{
    try{
        let commercials = await Commercial.find();

        res.status(200).json({success : true, message : "All Commercial Properties found",commercials});
    }
    catch(err){
        return res.status(500).json({success: false, message : "Error to find commercial properties",error : err.message});
    }
}

const commercialForAdmin = async(req,res)=>{
    try{
        const {id} = req.params;
        const commercial = await Commercial.findById(id);

        if(!commercial){
            return res.status(404).json({success:false, message : "Commercial Property fetch error" })
        }
        res.status(200).json({success:true,message : "Commercial Property fetched successfully" ,commercial});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const commercialForAdminByHorooId = async(req,res)=>{
    try{
        const {horooId} = req.params;
        const commercial = await Commercial.findOne({ horooId });

        if(!commercial){
            return res.status(404).json({success:false, message : "Commercial Property not found" })
        }
        res.status(200).json({success:true,message : "Commercial Property fetched successfully" ,commercial});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const updateCommercial = async(req,res)=>{
    try{
        const {id} = req.params;

        const updatedCommercial = await Commercial.findByIdAndUpdate( id, { $set: req.body }, { new: true, runValidators: true })
         .populate("state")
         .populate("city")
         .populate("area");

         if(!updatedCommercial){
            return res.status(404).json({success: true, message : "Update Commercial Property failed"});
         }
         res.status(200).json({success : true,message : "Commercial Property Updated successfully"} ,updatedCommercial);

    }
    catch(err){
        return res.status(500).json({success : false,message : "Server Error",error : err.message});
    }
}

const getCommercialsForUser = async(req,res)=>{
    try {
    const commercials = await Commercial.find({ isShow: true }) // only valid commercial properties
      .select("horooId slug horooAddress horooName area city state ownerPrice horooPrice priceSuffix mainImage availableFor commercialType averageRating totalRatings ownerWhatsapp latitude longitude") 
      .populate("state", "name") 
      .populate("city", "name")  
      .populate("area", "name"); 

    res.status(200).json({ success: true, commercials });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const getCommercialDetailForUser = async(req,res)=>{
   try {
    const { slug } = req.params;
    // Try finding by slug first, then by horooId as fallback (for backwards compatibility)
    let commercial = await Commercial.findOne({ slug })
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
        "commercialSize",
        "commercialType",
        "availability",
        "isVerified",
        "mainImage",
        "otherImages",
        "youtubeLink",
        "description",
        "averageRating",
        "totalRatings",
        "reviews"
      ])
      .populate("state", "name") 
      .populate("city", "name")
      .populate("area", "name");

    // Fallback to horooId if slug doesn't match
    if (!commercial) {
      commercial = await Commercial.findOne({ horooId: slug })
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
          "commercialSize",
          "commercialType",
          "availability",
          "isVerified",
          "mainImage",
          "otherImages",
          "youtubeLink",
          "description",
          "averageRating",
          "totalRatings",
          "reviews"
        ])
        .populate("state", "name") 
        .populate("city", "name")
        .populate("area", "name");
    }
    
    // Populate reviews
    if (commercial && commercial.reviews && commercial.reviews.length > 0) {
      try {
        await commercial.populate({
          path: "reviews",
          match: { isActive: true, isApproved: true },
          populate: { path: "user", select: "name profilePicture" },
          options: { sort: { createdAt: -1 } }
        });
      } catch (reviewError) {
        console.error('Error populating reviews:', reviewError);
      }
    }

    if (!commercial) {
      return res.status(404).json({ success: false, message: "Commercial Property not found" });
    }

    res.json({ success: true, commercial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// Get Filtered Commercial Properties
const getFilteredCommercials = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
      commercialType,
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

    // Commercial type filter
    if (commercialType) filter.commercialType = { $in: [commercialType] };
    
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
    const commercials = await Commercial.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .sort({ createdAt: -1 });

    const total = commercials.length;

    res.status(200).json({
      success: true,
      commercials,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Filtered Commercial Properties For Users (No limitations, only public data)
const getFilteredCommercialsForUser = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
      commercialType,
      availableFor,
      search
    } = req.query;

    // Build filter object with user restrictions
    let filter = {
      isShow: true        // Only show commercial properties marked to display (main requirement)
      // Removed availability and isVerified restrictions - allow all commercial properties that are marked to show
    };

    // Location filters
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (area) filter.area = area;

    // Commercial type filter
    if (commercialType) filter.commercialType = { $in: [commercialType] };
    
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
    const commercials = await Commercial.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .select('-ownerMobile -anotherNo -ownerName  -horooDescription -isVerified -isShow -realAddress')
      .sort({ createdAt: -1 });

    const total = commercials.length;

    res.status(200).json({
      success: true,
      commercials,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Migration function to generate slugs for existing commercials
const generateSlugsForExistingCommercials = async (req, res) => {
  try {
    const commercialsWithoutSlug = await Commercial.find({ 
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }]
    });

    if (commercialsWithoutSlug.length === 0) {
      return res.status(200).json({ success: true, message: "All commercials already have slugs", count: 0 });
    }

    let updatedCount = 0;
    const errors = [];

    for (const commercial of commercialsWithoutSlug) {
      try {
        const slug = await generateUniqueSlug(commercial.horooName);
        commercial.slug = slug;
        await commercial.save();
        updatedCount++;
      } catch (error) {
        errors.push({ horooId: commercial.horooId, horooName: commercial.horooName, error: error.message });
      }
    }

    res.status(200).json({ success: true, message: `Generated slugs for ${updatedCount} commercials`, count: updatedCount, total: commercialsWithoutSlug.length, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error generating slugs", error: error.message });
  }
};

export { addCommercial, getAllCommercials, commercialForAdmin, commercialForAdminByHorooId, updateCommercial, getCommercialsForUser, getCommercialDetailForUser, getFilteredCommercials, getFilteredCommercialsForUser, generateSlugsForExistingCommercials };