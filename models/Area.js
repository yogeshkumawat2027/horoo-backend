import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
    name :{
        type : String,
        unique : true,
        required : true
    },
    city : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "City",
        required : true
    }
},
{ timestamps : true}
);

export default mongoose.model('Area' , areaSchema );