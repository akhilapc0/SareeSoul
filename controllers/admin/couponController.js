
import Coupon from '../../models/couponModel.js';

export const getCoupons =async(req,res)=>{
    try{

        const coupons = await Coupon.find().sort({ createdAt: -1})
        res.render('coupon-list',{coupons,success:null,error:null})
    }
    catch(error){
        console.log('Error fetching coupons:',error);

        res.render('coupon-list',{coupons:[],success:null,error:"Error loading coupons"})
    }
}

export const getAddCoupon =(req,res)=>{
    try{

        res.render('add-coupon',{success:null,error:null})
    }
    catch(error){
        console.log('Error loading Add Coupon page:',error);
        res.render('add-coupon',{success:null,error:"Error loading page"})
    }
}



export const addCoupon =async(req,res)=>{
  try{
        const {code,discountValue,validityDate,minCartAmount,maxDiscount,usageLimit} =req.body;

        const existingCoupon =await Coupon.findOne({ code:code.trim().toUpperCase()});
        if(existingCoupon){
            return res.status(400).json({success:false,message:"Coupon code already exists"});
        }

        if(discountValue < 1 || discountValue >100){
            return res.status(400).json({success:false,message:"Discount must be between 1 and 100"});
        }

        const selectedDate=new Date(validityDate);
        const tomorrow=new Date();
        tomorrow.setDate(tomorrow.getDate()+1);
        tomorrow.setHours(0,0,0,0);
        selectedDate.setHours(0,0,0,0);

        if(selectedDate < tomorrow){
            return res.status(400).json({
                success:false,
                message:"Validity date must be at least tomorrow or later"
            });

        }




        if(minCartAmount < 0){
                return res.status(400).json({success:false,message:"Minimum cart amount cannot be negative "})
        }
        if(maxDiscount <=0){
            return res.status(400).json({success:false,message:"maximum discount must be greater than 0"})
        }
        if(usageLimit < 1){
            return res.status(400).json({success:false,message:"usage limit must be at least 1 "})
        }

        const newCoupon =new Coupon({
            code:code.trim().toUpperCase(),
            discountValue:Number(discountValue),
            validityDate:selectedDate,
            minCartAmount :Number(minCartAmount),
            maxDiscount:Number(maxDiscount),
            usageLimit:Number(usageLimit)
        })

        await newCoupon.save();

        return res.json({success:true,message:'Coupon added successfully'})


    }
    catch(error){
        console.log('Error adding coupon:',error);
        
        return res.status(500).json({success:false,message:"Server error,please try again "})
    }
}


export const toggleCouponStatus= async(req,res)=>{
    try{
        const {id}=req.params;
        const coupon=await Coupon.findById(id);
        if(!coupon){
            return res.status(400).json({success:false,message:"Coupon not found"});
        }
        coupon.isActive =!coupon.isActive;
        await coupon.save();

        const statusText =coupon.isActive ? 'activated':'blocked';
        return res.json({success:true,message:`Coupon ${statusText} successfully`})
        

    }catch(error){
        console.log('Error toggling coupon status:',error);
        return res.status(500).json({success:false,message:"Server error ,please try again"})
    }
}