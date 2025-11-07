import Wishlist from '../models/wishlistModel.js';

const getWishlistCount=async(req,res,next)=>{
    try{
        const userId=req.session?.user?._id || req.session?.passport?.user;
        
        if(userId){
            const wishlistCount=await Wishlist.countDocuments({userId});
            res.locals.wishlistCount=wishlistCount;

        }else{
            res.locals.wishlistCount=0;
        }
        next();

    }
    catch(error){
        console.error('Error in wishlistCount middleware:',error);
        res.locals.wishlistCount =0;
        next();
    }
}

export default getWishlistCount;