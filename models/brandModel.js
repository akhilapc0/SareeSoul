const { required } = require('joi');
const mongoose=require('mongoose');
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
    isDeleted:{
        type:Boolean,
        default:false
    }
},
{timestamps:true}
)

module.exports=mongoose.model('Brand',brandSchema);