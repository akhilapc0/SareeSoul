import Product from '../../models/productModel.js';

export const addProductOffer=async(req,res)=>{
    try{

        const {discountPercentage,startDate,endDate}=req.body;

        const {productId} =req.params;

        if(!discountPercentage || !startDate || !endDate){
            return res.status(400).json({success:false,message:"All fields are required"})
        }

        const product=await Product.findById(productId);
        if(!product){
            return res.status(400).json({success:false,message:"product not found"})
        }

        
    }
    catch(error){

    }
}
