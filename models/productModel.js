const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    name:{type:String,required:true},
    description:{type:String,required:true},
    actualPrice:{type:String,required:true},
    salesPrice:{type:String,required:true},
    categoryId:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
    brandId:{type:mongoose.Schema.Types.ObjectId,ref:'Brand'},
    rating:{type:Number,default:0},
    deletedAt:{type:Date,default:null}},{
        timestamps:true
    })



module.exports=mongoose.model('Product',productSchema);

