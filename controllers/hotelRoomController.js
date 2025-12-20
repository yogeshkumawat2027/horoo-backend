import HotelRoom from '../models/HotelRoom.js';
import State from '../models/State.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
import { uploadBase64ToCloudinary } from '../config/cloudinaryConfig.js';

// Function to generate slug from hotel room name
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen
};

// Function to ensure unique slug
const generateUniqueSlug = async (name) => {
    let slug = generateSlug(name);
    let slugExists = await HotelRoom.findOne({ slug });
    let counter = 1;

    while (slugExists) {
        slug = `${generateSlug(name)}-${counter}`;
        slugExists = await HotelRoom.findOne({ slug });
        counter++;
    }

    return slug;
};

// Generate unique Horoo ID for hotel rooms
const generateHorooId = async () => {
    try {
        // Find the last hotel room with horooId
        const lastHotelRoom = await HotelRoom.findOne({}, {}, { sort: { 'createdAt': -1 } });
        
        if (!lastHotelRoom || !lastHotelRoom.horooId) {
            return "HHR0001";
        }
        
        // Extract number from last horooId (e.g., HTL0001 -> 1)
        const lastNumber = parseInt(lastHotelRoom.horooId.substring(3));
        const nextNumber = lastNumber + 1;
        
        // Format with leading zeros (e.g., 1 -> 0001)
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        
        return `HHR${formattedNumber}`;
    } catch (error) {
        throw new Error("Error generating horooId");
    }
};

// Add Hotel Room Function
const addHotelRoom = async (req, res) => {
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
        const slug = await generateUniqueSlug(horooName);

        // Upload main image to Cloudinary if provided
        let mainImageUrl = null;
        if (mainImage) {
            try {
                const mainImageResult = await uploadBase64ToCloudinary(mainImage, `horoo-properties/hotel-rooms/${horooId}`);
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
                    uploadBase64ToCloudinary(image, `horoo-properties/hotel-rooms/${horooId}/gallery`)
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

        // Create new hotel room
        const newHotelRoom = new HotelRoom({
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
            horooDescription
        });

        // Save hotel room to database
        await newHotelRoom.save();

        // Populate the response with location details
        await newHotelRoom.populate([
            { path: 'state', select: 'name' },
            { path: 'city', select: 'name' },
            { path: 'area', select: 'name' }
        ]);

        res.status(201).json({
            success: true,
            message: "Hotel room added successfully",
            hotelRoom: newHotelRoom
        });

    } catch (error) {
        console.error("Error adding hotel room:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getAllHotelRooms = async(req,res)=>{
    try{
        let HotelRooms = await HotelRoom.find();

        res.status(200).json({success : true, message : "All Hotel Rooms found",HotelRooms});
    }
    catch(err){
        return res.status(500).json({success: false, message : "Error to find hotel rooms",error : err.message});
    }
}

const hotelRoomForAdmin = async(req,res)=>{
    try{
        const {id} = req.params;
        const hotelRoom = await HotelRoom.findById(id);

        if(!hotelRoom){
            return res.status(404).json({success:false, message : "Hotel Room fetch error" })
        }
        res.status(200).json({success:true,message : "Hotel Room fetched successfully" ,hotelRoom});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const hotelRoomForAdminByHorooId = async(req,res)=>{
    try{
        const {horooId} = req.params;
        const hotelRoom = await HotelRoom.findOne({ horooId });

        if(!hotelRoom){
            return res.status(404).json({success:false, message : "Hotel Room not found" })
        }
        res.status(200).json({success:true,message : "Hotel Room fetched successfully" ,hotelRoom});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const updateHotelRoom = async(req,res)=>{
    try{
        const {id} = req.params;

        const updatedHotelRoom = await HotelRoom.findByIdAndUpdate( id, { $set: req.body }, { new: true, runValidators: true })
         .populate("state")
         .populate("city")
         .populate("area");

         if(!updatedHotelRoom){
            return res.status(404).json({success: true, message : "Update Hotel Room failed"});
         }
         res.status(200).json({success : true,message : "hotel room Updated successfully"} ,updatedHotelRoom);

    }
    catch(err){
        return res.status(500).json({success : false,message : "Server Error",error : err.message});
    }
}

const getHotelRoomsForUser = async(req,res)=>{
    try {
    const hotelRooms = await HotelRoom.find({ isShow: true }) // only valid hotel rooms
      .select("horooId slug horooName horooAddress area city state ownerPrice horooPrice priceSuffix mainImage availableFor roomType averageRating totalRatings ownerWhatsapp latitude longitude") 
      .populate("state", "name") 
      .populate("city", "name")  
      .populate("area", "name"); 

    res.status(200).json({ success: true, hotelRooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const getHotelRoomDetailForUser = async(req,res)=>{
   try {
    const { slug } = req.params;
    
    // Try to find by slug first, fallback to horooId
    let hotelRoom = await HotelRoom.findOne({ slug: slug })
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
        "averageRating",
        "totalRatings",
        "reviews",
      ])
      .populate("state", "name") 
      .populate("city", "name")
      .populate("area", "name");

    // If not found by slug, try finding by horooId (backward compatibility)
    if (!hotelRoom) {
      hotelRoom = await HotelRoom.findOne({ horooId: slug })
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
          "averageRating",
          "totalRatings",
          "reviews",
        ])
        .populate("state", "name") 
        .populate("city", "name")
        .populate("area", "name");
    }

    if (!hotelRoom) {
      return res.status(404).json({ success: false, message: "Hotel Room not found" });
    }

    // Populate reviews separately with error handling
    if (hotelRoom && hotelRoom.reviews && hotelRoom.reviews.length > 0) {
      try {
        await hotelRoom.populate({
          path: "reviews",
          match: { isActive: true, isApproved: true },
          populate: { path: "user", select: "name profilePicture" },
          options: { sort: { createdAt: -1 } }
        });
      } catch (reviewError) {
        console.error('Error populating reviews:', reviewError);
      }
    }

    res.json({ success: true, hotelRoom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// Get Filtered Hotel Rooms
const getFilteredHotelRooms = async (req, res) => {
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
    const hotelRooms = await HotelRoom.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .sort({ createdAt: -1 });

    const total = hotelRooms.length;

    res.status(200).json({
      success: true,
      hotelRooms,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Filtered Hotel Rooms For Users (No limitations, only public data)
const getFilteredHotelRoomsForUser = async (req, res) => {
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
      isShow: true        // Only show hotel rooms marked to display (main requirement)
      // Removed availability and isVerified restrictions - allow all hotel rooms that are marked to show
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
    const hotelRooms = await HotelRoom.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .select('-ownerMobile -anotherNo -ownerName  -horooDescription -isVerified -isShow -realAddress')
      .sort({ createdAt: -1 });

    const total = hotelRooms.length;

    res.status(200).json({
      success: true,
      hotelRooms,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Migration function to generate slugs for existing hotel rooms
const generateSlugsForExistingHotelRooms = async (req, res) => {
    try {
        const hotelRooms = await HotelRoom.find({ slug: { $exists: false } });
        
        if (hotelRooms.length === 0) {
            return res.status(200).json({
                success: true,
                message: "All hotel rooms already have slugs",
                updated: 0
            });
        }

        let updatedCount = 0;
        
        for (const hotelRoom of hotelRooms) {
            const slug = await generateUniqueSlug(hotelRoom.horooName);
            hotelRoom.slug = slug;
            await hotelRoom.save();
            updatedCount++;
        }

        res.status(200).json({
            success: true,
            message: `Successfully generated slugs for ${updatedCount} hotel rooms`,
            updated: updatedCount
        });
    } catch (error) {
        console.error("Error generating slugs:", error);
        res.status(500).json({
            success: false,
            message: "Error generating slugs for existing hotel rooms",
            error: error.message
        });
    }
};

export { addHotelRoom, getAllHotelRooms,hotelRoomForAdmin,hotelRoomForAdminByHorooId,updateHotelRoom ,getHotelRoomsForUser,getHotelRoomDetailForUser,getFilteredHotelRooms,getFilteredHotelRoomsForUser,generateSlugsForExistingHotelRooms};