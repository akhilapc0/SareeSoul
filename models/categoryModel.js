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
        
        min:0,
        max:100
    },
    startDate:{type:Date},
    endDate:{type:Date},
    
}

},
 {
timestamps:true
 });

export default mongoose.model('Category',categorySchema);