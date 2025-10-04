import mongoose from 'mongoose';

const stateSchema = new mongoose.Schema({
    name :{
        type : String,
        unique : true,
        required : true
    },
},
{ timestamps : true}
);

export default mongoose.model('State' , stateSchema );