import  mongoose from 'mongoose';

const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
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
 },

offer:{
    discountPercentage:{
        type:Number,
        default:0,
        min:1,
        max:100
    },
    startDate:{type:Date,default:null},
    endDate:{type:Date,default:null},
    isDeleted:{type:Boolean,default:false}
}

},
 {
timestamps:true
 });

export default mongoose.model('Category',categorySchema);