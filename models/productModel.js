import  mongoose from 'mongoose';

const productSchema=new mongoose.Schema({
    name:{type:String,required:true},
    description:{type:String,required:true},
    actualPrice:{type:Number,required:true},
    salesPrice:{type:Number,required:true},
    categoryId:{type:mongoose.Schema.Types.ObjectId,ref:"Category"},
    brandId:{type:mongoose.Schema.Types.ObjectId,ref:'Brand'},
    rating:{type:Number,default:0},
    isBlocked:{
        type:Boolean,
        default:false
    },
    deletedAt:{type:Date,default:null}},{
        timestamps:true
    })



export default mongoose.model('Product',productSchema);

