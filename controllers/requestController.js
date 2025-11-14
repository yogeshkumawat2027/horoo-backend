import Request from "../models/Request.js"


const addRequest = async (req,res)=>{
    try{
        const {horooId, userPhoneNo, userName} = req.body;

        const newRequest = await Request.create({
           horooId,
           userPhoneNo,
           userName,
           status : "New"
        });

        res.status(201).json({
            success : true,
            message : "request added Successfully",
            data : newRequest
        });
    }catch(err){
        res.status(500).json({
            success : false,
            message : `Adding request faild Error : ${err.message}`
        })
    }
}

// Get all requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 }); 
    // latest first

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message
    });
  }
};


const updateRequest = async (req,res)=>{
    try{
        const {id} = req.params;

    const updatedRequest = req.body;

    const updated = await Request.findByIdAndUpdate(id , updatedRequest , {new : true});

    if(!updated){
        res.status(404).json({success : false , message : " Request not found"});
    }

    res.json({
        success : true,
        message : "request updated",
        data : updated
    });
    }catch(err){
        res.status(500).json({success : false , message : `Updating request faild Error : ${err.message}`})
    }
    
}

 const filterRequests = async (req, res) => {
  try {
    const { status, horooId } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (horooId) filter.horooId = horooId;

    const requests = await Request.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

 const searchRequests = async (req, res) => {
  try {
    const { query } = req.query;

    const results = await Request.find({
      $or: [
        { userPhoneNo: { $regex: query, $options: "i" } },
        { userName: { $regex: query, $options: "i" } }
      ]
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export {addRequest , getAllRequests , updateRequest , filterRequests , searchRequests };