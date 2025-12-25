import House from '../models/House.js';
import State from '../models/State.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
import { uploadBase64ToCloudinary } from '../config/cloudinaryConfig.js';

// Slug generation functions
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
};

const generateUniqueSlug = async (baseSlug) => {
    let slug = baseSlug;
    let counter = 1;
    
    while (await House.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
};

// Generate unique Horoo ID for houses
const generateHorooId = async () => {
    try {
        // Find the last house with horooId
        const lastHouse = await House.findOne({}, {}, { sort: { 'createdAt': -1 } });
        
        if (!lastHouse || !lastHouse.horooId) {
            return "HHE0001";
        }
        
        // Extract number from last horooId (e.g., HSE0001 -> 1)
        const lastNumber = parseInt(lastHouse.horooId.substring(3));
        const nextNumber = lastNumber + 1;
        
        // Format with leading zeros (e.g., 1 -> 0001)
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        
        return `HHE${formattedNumber}`;
    } catch (error) {
        throw new Error("Error generating horooId");
    }
};

// Add House Function
const addHouse = async (req, res) => {
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
            houseSize,
            houseType,
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

        // Generate unique slug
        const baseSlug = generateSlug(horooName);
        const slug = await generateUniqueSlug(baseSlug);

        // Upload main image to Cloudinary if provided
        let mainImageUrl = null;
        if (mainImage) {
            try {
                const mainImageResult = await uploadBase64ToCloudinary(mainImage, `horoo-properties/houses/${horooId}`);
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
                    uploadBase64ToCloudinary(image, `horoo-properties/houses/${horooId}/gallery`)
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

        // Create new house
        const newHouse = new House({
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
            houseSize,
            houseType: houseType || [],
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

        // Save house to database
        await newHouse.save();

        // Populate the response with location details
        await newHouse.populate([
            { path: 'state', select: 'name' },
            { path: 'city', select: 'name' },
            { path: 'area', select: 'name' }
        ]);

        res.status(201).json({
            success: true,
            message: "House added successfully",
            house: newHouse
        });

    } catch (error) {
        console.error("Error adding house:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getAllHouses = async(req,res)=>{
    try{
        let houses = await House.find();

        res.status(200).json({success : true, message : "All Houses found",houses});
    }
    catch(err){
        return res.status(500).json({success: false, message : "Error to find houses",error : err.message});
    }
}

const houseForAdmin = async(req,res)=>{
    try{
        const {id} = req.params;
        const house = await House.findById(id);

        if(!house){
            return res.status(404).json({success:false, message : "House fetch error" })
        }
        res.status(200).json({success:true,message : "House fetched successfully" ,house});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const houseForAdminByHorooId = async(req,res)=>{
    try{
        const {horooId} = req.params;
        const house = await House.findOne({ horooId });

        if(!house){
            return res.status(404).json({success:false, message : "House not found" })
        }
        res.status(200).json({success:true,message : "House fetched successfully" ,house});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const updateHouse = async(req,res)=>{
    try{
        const {id} = req.params;

        const updatedHouse = await House.findByIdAndUpdate( id, { $set: req.body }, { new: true, runValidators: true })
         .populate("state")
         .populate("city")
         .populate("area");

         if(!updatedHouse){
            return res.status(404).json({success: true, message : "Update House failed"});
         }
         res.status(200).json({success : true,message : "House Updated successfully"} ,updatedHouse);

    }
    catch(err){
        return res.status(500).json({success : false,message : "Server Error",error : err.message});
    }
}

const getHousesForUser = async(req,res)=>{
    try {
    const houses = await House.find({ isShow: true }) // only valid houses
      .select("horooId slug horooName horooAddress area city state ownerPrice horooPrice priceSuffix mainImage availableFor houseType averageRating totalRatings ownerWhatsapp latitude longitude") 
      .populate("state", "name") 
      .populate("city", "name")  
      .populate("area", "name"); 

    res.status(200).json({ success: true, houses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const getHouseDetailForUser = async(req,res)=>{
   try {
    const { slug } = req.params;
    
    // Try to find by slug first, if not found try horooId (for backward compatibility)
    let house = await House.findOne({ slug: slug })
      .select([
        "_id",
        "horooId",
        "slug",
        "propertyName",
        "horooName",
        "ownerMobile",
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
        "priceSuffix",
        "pricePlans",
        "availableFor",
        "houseSize",
        "houseType",
        "availability",
        "isVerified",
        "mainImage",
        "otherImages",
        "youtubeLink",
        "description",
        "averageRating",
        "totalRatings",
        "reviews",
      ])
      .populate("state", "name") 
      .populate("city", "name")
      .populate("area", "name");

    // If not found by slug, try horooId (backward compatibility)
    if (!house) {
      house = await House.findOne({ horooId: slug })
        .select([
          "_id",
          "horooId",
          "slug",
          "propertyName",
          "horooName",
          "ownerMobile",
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
          "priceSuffix",
          "pricePlans",
          "availableFor",
          "houseSize",
          "houseType",
          "availability",
          "isVerified",
          "mainImage",
          "otherImages",
          "youtubeLink",
          "description",
          "averageRating",
          "totalRatings",
          "reviews",
        ])
        .populate("state", "name") 
        .populate("city", "name")
        .populate("area", "name");
    }

    if (!house) {
      return res.status(404).json({ success: false, message: "House not found" });
    }

    // Populate reviews separately with error handling
    if (house && house.reviews && house.reviews.length > 0) {
      try {
        await house.populate({
          path: "reviews",
          match: { isActive: true, isApproved: true },
          populate: { path: "user", select: "name profilePicture" },
          options: { sort: { createdAt: -1 } }
        });
      } catch (reviewError) {
        console.error('Error populating reviews:', reviewError);
      }
    }

    res.json({ success: true, house });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// Get Filtered Houses
const getFilteredHouses = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
      houseType,
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

    // House type filter
    if (houseType) filter.houseType = { $in: [houseType] };
    
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
    const houses = await House.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .sort({ createdAt: -1 });

    const total = houses.length;

    res.status(200).json({
      success: true,
      houses,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Filtered Houses For Users (No limitations, only public data)
const getFilteredHousesForUser = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
      houseType,
      availableFor,
      search
    } = req.query;

    // Build filter object with user restrictions
    let filter = {
      isShow: true        // Only show houses marked to display (main requirement)
      // Removed availability and isVerified restrictions - allow all houses that are marked to show
    };

    // Location filters
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (area) filter.area = area;

    // House type filter
    if (houseType) filter.houseType = { $in: [houseType] };
    
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
    const houses = await House.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .select('-ownerMobile -anotherNo -ownerName  -horooDescription -isVerified -isShow -realAddress')
      .sort({ createdAt: -1 });

    const total = houses.length;

    res.status(200).json({
      success: true,
      houses,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Migration function to generate slugs for existing houses
const generateSlugsForExistingHouses = async (req, res) => {
    try {
        const houses = await House.find({ $or: [{ slug: null }, { slug: '' }] });
        
        let updated = 0;
        let failed = 0;
        
        for (const house of houses) {
            try {
                const baseSlug = generateSlug(house.horooName || house.horooId);
                const slug = await generateUniqueSlug(baseSlug);
                
                house.slug = slug;
                await house.save();
                updated++;
            } catch (error) {
                console.error(`Failed to update slug for house ${house.horooId}:`, error);
                failed++;
            }
        }
        
        res.status(200).json({
            success: true,
            message: `Slug migration completed. Updated: ${updated}, Failed: ${failed}`,
            updated,
            failed
        });
    } catch (error) {
        console.error('Error in slug migration:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating slugs',
            error: error.message
        });
    }
};

export { addHouse, getAllHouses, houseForAdmin, houseForAdminByHorooId, updateHouse, getHousesForUser, getHouseDetailForUser, getFilteredHouses, getFilteredHousesForUser, generateSlugsForExistingHouses };