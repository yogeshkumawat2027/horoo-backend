import Room from '../models/Room.js';
import State from '../models/State.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
import { uploadBase64ToCloudinary } from '../config/cloudinaryConfig.js';
// import redis from '../config/redis.js';

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
    while (await Room.findOne({ slug })) {
        slug = `${generateSlug(horooName)}-${counter}`;
        counter++;
    }
    
    return slug;
};

// Generate unique Horoo ID
const generateHorooId = async () => {
    try {
        // Find the last room with horooId
        const lastRoom = await Room.findOne({}, {}, { sort: { 'createdAt': -1 } });
        
        if (!lastRoom || !lastRoom.horooId) {
            return "HRM0001";
        }
        
        // Extract number from last horooId (e.g., HRM0001 -> 1)
        const lastNumber = parseInt(lastRoom.horooId.substring(3));
        const nextNumber = lastNumber + 1;
        
        // Format with leading zeros (e.g., 1 -> 0001)
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        
        return `HRM${formattedNumber}`;
    } catch (error) {
        throw new Error("Error generating horooId");
    }
};

// Add Room Function
const addRoom = async (req, res) => {
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
        if (!ownerName || !ownerMobile || !state || !city || !area || !pincode || !ownerPrice) {
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

        // Generate unique Horoo ID and slug
        const horooId = await generateHorooId();
        const slug = await generateUniqueSlug(horooName || propertyName || 'room');

        // Upload main image to Cloudinary if provided
        let mainImageUrl = null;
        if (mainImage) {
            try {
                const mainImageResult = await uploadBase64ToCloudinary(mainImage, `horoo-properties/rooms/${horooId}`);
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
                    uploadBase64ToCloudinary(image, `horoo-properties/rooms/${horooId}/gallery`)
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

        // Create new room
        const newRoom = new Room({
            horooId,
            slug,
            
            // Basic property details
            propertyName: propertyName || `Room ${horooId}`,
            horooName: horooName || propertyName || `Room ${horooId}`,
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
            horooPrice: Number(horooPrice || ownerPrice),
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

        // Save room to database
        await newRoom.save();

        // Populate the response with location details
        await newRoom.populate([
            { path: 'state', select: 'name' },
            { path: 'city', select: 'name' },
            { path: 'area', select: 'name' }
        ]);

        res.status(201).json({
            success: true,
            message: "Room added successfully",
            room: newRoom
        });

    } catch (error) {
        console.error("Error adding room:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getAllRooms = async(req,res)=>{
    try{
        let rooms = await Room.find()
            .populate('state', 'name')
            .populate('city', 'name') 
            .populate('area', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({success : true, message : "All Rooms found", rooms});
    }
    catch(err){
        return res.status(500).json({success: false, message : "Error to find rooms",error : err.message});
    }
}

const roomForAdmin = async(req,res)=>{
    try{
        const {id} = req.params;
        const room = await Room.findById(id)
            .populate('state', 'name')
            .populate('city', 'name') 
            .populate('area', 'name');

        if(!room){
            return res.status(404).json({success:false, message : "Room fetch error" })
        }
        res.status(200).json({success:true,message : "Room fetched successfully" ,room});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const roomForAdminByHorooId = async(req,res)=>{
    try{
        const {horooId} = req.params;
        const room = await Room.findOne({ horooId })
            .populate('state', 'name')
            .populate('city', 'name') 
            .populate('area', 'name');

        if(!room){
            return res.status(404).json({success:false, message : "Room not found" })
        }
        res.status(200).json({success:true,message : "Room fetched successfully" ,room});
    }
    catch(err){
        return res.status(500).json({success : false , error : err.message});
    }
}

const updateRoom = async(req,res)=>{
    try{
        const {id} = req.params;

        const updatedRoom = await Room.findByIdAndUpdate( id, { $set: req.body }, { new: true, runValidators: true })
         .populate("state")
         .populate("city")
         .populate("area");

         if(!updatedRoom){
            return res.status(404).json({success: true, message : "Update Room failed"});
         }
         res.status(200).json({success : true,message : "room Updated successfully"} ,updateRoom);

    }
    catch(err){
        return res.status(500).json({success : false,message : "Server Error",error : err.message});
    }
}
const getRoomsForUser = async(req,res)=>{
    try {
    // const cacheKey = 'all_rooms_user';
    
    // // Check Redis first
    // const cached = await redis.get(cacheKey);
    // if (cached) {
    //   return res.status(200).json({ success: true, rooms: cached, source: 'cache' });
    // }

    // Fetch from DB
    const rooms = await Room.find({ isShow: true })
      .select("horooId slug horooName horooAddress area city state ownerPrice horooPrice priceSuffix mainImage availableFor roomType averageRating totalRatings ownerWhatsapp latitude longitude") 
      .populate("state", "name") 
      .populate("city", "name")  
      .populate("area", "name");
      // .lean(); // Convert to plain objects

    // // Store in Redis for 10 minutes
    // await redis.set(cacheKey, rooms, { ex: 600 });

    res.status(200).json({ success: true, rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const getRoomDeatilForUser = async(req,res)=>{
   try {
    const { slug } = req.params;
    // const cacheKey = `room_detail:${slug}`;
    
    // // Check Redis first
    // const cached = await redis.get(cacheKey);
    // if (cached) {
    //   return res.status(200).json({ success: true, room: cached, source: 'cache' });
    // }

    // Try to find by slug first
    let room = await Room.findOne({ slug: slug })
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
        "latitude",
        "longitude",
        "horooAddress",
        "facilities",
        "ownerPrice",
        "horooPrice",
        "priceSuffix",
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
        "ownerWhatsapp",
        "averageRating",
        "totalRatings",
        "reviews"
      ])
      .populate("state", "name") 
      .populate("city", "name")
      .populate("area", "name");

    // If not found by slug, try by horooId (backwards compatibility)
    if (!room) {
      room = await Room.findOne({ horooId: slug })
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
          "latitude",
          "longitude",
          "horooAddress",
          "facilities",
          "ownerPrice",
          "horooPrice",
          "priceSuffix",
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
          "reviews"
        ])
        .populate("state", "name") 
        .populate("city", "name")
        .populate("area", "name");
    }
    
    // Populate reviews separately to avoid breaking the page
    if (room && room.reviews && room.reviews.length > 0) {
      try {
        await room.populate({
          path: "reviews",
          match: { isActive: true, isApproved: true },
          populate: { path: "user", select: "name profilePicture" },
          options: { sort: { createdAt: -1 } }
        });
      } catch (reviewError) {
        console.error('Error populating reviews:', reviewError);
      }
    }

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // // Store in Redis for 15 minutes
    // await redis.set(cacheKey, room, { ex: 900 });

    res.json({ success: true, room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// Get Filtered Rooms
const getFilteredRooms = async (req, res) => {
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
    const rooms = await Room.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .sort({ createdAt: -1 });

    const total = rooms.length;

    res.status(200).json({
      success: true,
      rooms,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Filtered Rooms For Users (No limitations, only public data)
const getFilteredRoomsForUser = async (req, res) => {
  try {
    const {
      state,
      city, 
      area,
      roomType,
      availableFor,
      search
    } = req.query;

    // // Create unique cache key based on filters
    // const cacheKey = `filtered:${state||'x'}:${city||'x'}:${area||'x'}:${roomType||'x'}:${availableFor||'x'}:${search||'x'}`;
    
    // // Check Redis first
    // const cached = await redis.get(cacheKey);
    // if (cached) {
    //   return res.status(200).json({
    //     success: true,
    //     rooms: cached,
    //     total: cached.length,
    //     source: 'cache'
    //   });
    // }

    // Build filter object with user restrictions
    let filter = {
      isShow: true        // Only show rooms marked to display (main requirement)
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

    // Execute query and exclude sensitive fields (but keep both prices)
    const rooms = await Room.find(filter)
      .populate('state', 'name')
      .populate('city', 'name') 
      .populate('area', 'name')
      .select('-ownerMobile -anotherNo -ownerName -horooDescription -isVerified -isShow -realAddress')
      .sort({ createdAt: -1 });

    const total = rooms.length;

    // // Store in Redis for 5 minutes (shorter for filtered results)
    // await redis.set(cacheKey, rooms, { ex: 300 });

    res.status(200).json({
      success: true,
      rooms,
      total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Utility function to generate slugs for existing rooms (migration)
const generateSlugsForExistingRooms = async (req, res) => {
  try {
    // Find all rooms without a slug
    const roomsWithoutSlug = await Room.find({ 
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });

    if (roomsWithoutSlug.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "All rooms already have slugs",
        count: 0
      });
    }

    let updatedCount = 0;
    const errors = [];

    for (const room of roomsWithoutSlug) {
      try {
        const slug = await generateUniqueSlug(room.horooName || room.propertyName || 'room');
        room.slug = slug;
        await room.save();
        updatedCount++;
      } catch (error) {
        errors.push({ 
          horooId: room.horooId, 
          horooName: room.horooName, 
          error: error.message 
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Generated slugs for ${updatedCount} rooms`,
      count: updatedCount,
      total: roomsWithoutSlug.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Error generating slugs",
      error: error.message 
    });
  }
};

export { addRoom, getAllRooms,roomForAdmin,roomForAdminByHorooId,updateRoom ,getRoomsForUser,getRoomDeatilForUser,getFilteredRooms,getFilteredRoomsForUser,generateSlugsForExistingRooms};