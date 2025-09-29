const mongoose=require('mongoose');

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    description:{
        type:String,
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
 {
timestamps:true
 });

 module.exports=mongoose.model('Category',categorySchema);