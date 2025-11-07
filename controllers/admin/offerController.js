import Product from '../../models/productModel.js';

import Category from '../../models/categoryModel.js';

const addProductOffer =async(req,res)=>{

    try{
    
    const {productId} =req.params;
    const {discountPercentage,startDate,endDate}=req.body;

    if(!discountPercentage || !startDate || !endDate){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        })
    }
    if(discountPercentage < 1 || discountPercentage >100){
        return res.status(400).json({
            success:false,
            message:"Discount must be between 1-100%"
        });
    }
    
    const start=new Date(startDate);
    const end=new Date(endDate);

    if(isNaN(start) || isNaN(end)){
        return res.status(400).json({
            success:false,
            message:"Invalid date format"
        })
    }

    const tomorrow=new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    tomorrow.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    if(start < tomorrow){
        return res.status(400).json({
            success:false,
            message:"Start date must be at least tomorrow or later"
        })
    }

    if(end <=start){
        return res.status(400).json({
            success:false,
            message:"End date must be after start date"
        })
    }

    const product=await Product.findById(productId);
    if(!product){
        return res.status(400).json({
            success:false,
            message:'Product not found'
        })
    }
    product.offer={
        discountPercentage:Number(discountPercentage),
        startDate:start,
        endDate:end,
    }
    await product.save();

    res.status(200).json({
        success:true,
        message:"Offer added successfully",
        offer:product.offer
    })

}
catch(error){
    console.error('Add product offer error:',error);
    res.status(500).json({
        success:false,
        message:"Server error"
    })
}
}


const removeProductOffer= async(req,res)=>{
    try{

        const {productId}=req.params;

        const product=await Product.findById(productId);
        if(!product){
            return res.status(400).json({
                success:false,
                message:"Product not found"
            })
        }

        product.offer=null;
        await product.save();
        res.status(200).json({
            success:true,
            message:"Offer removed  successfully!"
        })

    }
    catch(error){
        console.error('Remove product offer error:',error);
        res.status(500).json({
            success:false,
            message:'Server error'
        })

    }
}


const addCategoryOffer=async(req,res)=>{
    try{
        const {categoryId}=req.params;
        const {discountPercentage,startDate,endDate}=req.body;

        if(!discountPercentage || !startDate || !endDate){
            return res.status(400).json({success:false,message:"All fields are required"});
        }

        if(discountPercentage <1 || discountPercentage>100){
            return res.status(400).json({
                success:false,
                message:"Discount must be between 1-100%"
            })
        }

       
        const start=new Date(startDate);
        const end=new Date(endDate);
        if(isNaN(start) || isNaN(end)){
            return res.status(400).json({
                succes:false,
                message:"Invalid date format"
            })
        }

        const tomorrow=new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0,0,0,0);
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);

        if(start < tomorrow){
            return res.status(400).json({
                success:false,
                message:"start date must be at least tomorrow or later"
            })
        }

        if(end <=start){
            return res.status(400).json({
                success:false,
                message:"End date must be after start date"
            })
        }

        const category= await Category.findById(categoryId);
        if(!category){
            return res.status(400).json({
                success:false,
                message:"Category not found"
            })
        }
        category.offer={
            discountPercentage:Number(discountPercentage),
            startDate:start,
            endDate:end,
        }

        await category.save();

        res.status(200).json({
            success:true,
            message:"Category offer added successfully",
            offer:category.offer
        });




    }
    catch(error){
        console.error('Add category offer error:',error);
        res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}


const removeCategoryOffer=async(req,res)=>{
    try{

        const {categoryId} =req.params;
        const category=await Category.findById(categoryId);
        if(!category){
            return res.status(400).json({success:false,message:"product not found"});
        }
        category.offer=null;
        await category.save();
        res.status(200).json({
            success:true,
            message:"Category offer removed successfully"
        })

    }
    catch(error){
        console.error('Remove category offer error:',error);
        res.status(500).json({
            success:false,
            message:"Server error"
        });
    }
};

const calculateOfferPrice = (product, category) => {
    const now = new Date();
    
    
    
    console.log('Product offer:', product.offer);
    console.log('Category offer:', category?.offer);
    console.log('Current date:', now);
    
    
    let productDiscount = 0;
    if (product.offer) {
        console.log('Product has offer object');
        console.log('Start date:', product.offer.startDate);
        console.log('End date:', product.offer.endDate);
        console.log('Discount %:', product.offer.discountPercentage);
        
        if (now >= product.offer.startDate && now <= product.offer.endDate) {
            productDiscount = product.offer.discountPercentage;
            console.log(' Product offer is VALID');
        } else {
            console.log(' Product offer is EXPIRED or NOT STARTED');
        }
    }
    
    
    let categoryDiscount = 0;
    if (category?.offer) {
        console.log('Category has offer object');
        console.log('Start date:', category.offer.startDate);
        console.log('End date:', category.offer.endDate);
        console.log('Discount %:', category.offer.discountPercentage);
        
        if (now >= category.offer.startDate && now <= category.offer.endDate) {
            categoryDiscount = category.offer.discountPercentage;
            console.log(' Category offer is VALID');
        } else {
            console.log(' Category offer is EXPIRED or NOT STARTED');
        }
    }
    
    console.log('Final product discount:', productDiscount);
    console.log('Final category discount:', categoryDiscount);
    
    
    
    const finalDiscount = Math.max(productDiscount, categoryDiscount);
    const offerPrice = product.salesPrice - (product.salesPrice * finalDiscount / 100);
    
    return {
        offerPrice: Math.round(offerPrice * 100) / 100,
        discount: finalDiscount,
        originalPrice: product.salesPrice,
        hasOffer: finalDiscount > 0
    };
};

const offerController={
    addProductOffer,
    removeProductOffer,
    addCategoryOffer,
    removeCategoryOffer,
    calculateOfferPrice
}

export default offerController;