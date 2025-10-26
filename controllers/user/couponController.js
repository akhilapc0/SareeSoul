import Coupon from '../../models/couponModel.js';

import User from '../../models/userModel.js';

export const applyCoupon=async(req,res)=>{
    try{
    const {couponCode,subtotal} =req.body;
    const userId =req.session?.user?._id || req.session?.passport?.user;

    const coupon =await Coupon.findOne({
        code:couponCode.trim().toUpperCase()
    })

    if(!coupon){
        return res.json({success:false,message:"Invalid coupon code"});
    }

    if(!coupon.isActive){
        return res.json({success:false,message:"This coupon is not available"})
    }

    if(coupon.validityDate < new Date()){
        return res.json({message:false,message:"This coupon has expired"})
    }

    if(coupon.usedCount >= coupon.usageLimit){
        return res.json({success: false,message:"This coupon has reached its usage limit"})
    }

    if(coupon.usedBy.includes(userId)){
        return res.json({success:false,message:"You have already used this coupon"});
    }

    if(subtotal < coupon.minCartAmount ){

        const remaining=coupon.minCartAmount - subtotal;
        return res.json({
            success:false,
            message:`Add ₹${remaining.toFixed(2)} more to use this coupon (Min: ₹${coupon.minCartAmount})`
        })
    }

    let discountAmount =(subtotal * coupon.discountValue) /100;

    if(discountAmount > coupon.maxDiscount){

        discountAmount=coupon.maxDiscount;
    }

    if(discountAmount >subtotal){
        discountAmount =subtotal;
    }
    const total = subtotal - discountAmount;

    req.session.appliedCoupon ={
        code:coupon.code,
        discountValue:coupon.discountValue,
        discountAmount,
        couponId:coupon._id
    }

    return res.json({
        success:true,
        discount:discountAmount,
        total,
        message:`${coupon.code} applied! You saved ₹${discountAmount.toFixed(2)}`
    })
    }
    catch(error){
        console.log('error in applyCoupon :',error);
        res.status(500).json({success:false,message:'Server error'});
    }
}


export const removeCoupon =async(req,res) =>{
    try{

        const {subtotal} =req.body;

        delete req.session.appliedCoupon;

        return res.json({
            success:true,
            discount:0,
            total:subtotal,
            message:'Coupon removed'
        })

    }
    catch(error){
        console.log('Error in removeCoupon:',error);
        res.status(500).json({success:false,message:"Server error"})
    }
}