import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
    name :{
        type : String,
        unique : true,
        required : true
    },
    state : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "State",
        required : true
    }
},
{ timestamps : true}
);

export default mongoose.model('City' , citySchema );