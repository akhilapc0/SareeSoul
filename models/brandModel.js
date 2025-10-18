import Joi from 'joi';
import mongoose from 'mongoose';
const brandSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        default:'',
        trim:true
    },
    image:{
        type:String,
        required:true,
        default:'',
        trim:true
    },
    isBlocked:{
        type:Boolean,
        default:false

    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},
{timestamps:true}
)

export default mongoose.model('Brand',brandSchema);