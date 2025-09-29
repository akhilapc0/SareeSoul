const mongoose=require('mongoose');

const variantSchema=new mongoose.Schema({
    
    productId:{type:mongoose.Schema.Types.ObjectId,ref:"Product"},
    colour:{type:String,required:true},
    stock:{type:Number,required:true,default:0},
    images:[{type:String,required:true}],
   
    isBlocked:{type:Boolean,default:false},
    deletedAt:{type:Date,default:null}
},
    {timestamps:true})

module.exports=mongoose.model('Variant',variantSchema);
