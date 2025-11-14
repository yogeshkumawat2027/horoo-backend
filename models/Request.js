import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
   horooId: { type: String, required : true },
   userName : {type : String , required : true},
   userPhoneNo : {type : String,  required : true},
   status : { type: String, 
              enum: ["New", "Pending", "Booked", "Not Booked","Fraud"],
              default : "New"   },
},
{ timestamps: true }
);

export default mongoose.model("Request", requestSchema);   