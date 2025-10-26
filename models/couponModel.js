import mongoose from 'mongoose';

const couponSchema =new mongoose.Schema({

    code:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        uppercase:true
    },
    discountValue:{
        type:Number,
        required:true,
        min:1,
        max:100
    },
    validityDate:{
        type:Date,
        required:true
    },
    minCartAmount:{
        type:Number,
        required:true,
        min:0,
        default:0
    },
    maxDiscount:{
        type:Number,
        required:true,
        min:0
    },
    usageLimit:{
        type:Number,
        required:true,
        min:1
    },
    usedCount:{
        type:Number,
        default:0,
        min:0
    },
    usedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps: true
});
export default mongoose.model('Coupon',couponSchema);
