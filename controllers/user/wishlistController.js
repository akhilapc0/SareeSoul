import Wishlist from "../../models/wishlistModel.js";




  export const addToWishlist=async(req,res)=>{
    try{
    const userId=req.user._id;
    const {productId,variantId}=req.body;
    const existingItem=await Wishlist.findOne({userId,productId,variantId});
    if(existingItem){
        return res.status(400).json({message:"Product already in wishlist"})
    }
    const wishlistItem=new Wishlist({userId,variantId,productId});
    await wishlistItem.save();
    res.status(200).json({message:"added to wishlist",wishlistItem})
  }
  catch(error){
    console.error(error);
    res.status(500).json({message:"something went wrong"})
  }
}


export const getWishlist=async(req,res)=>{
    try{
        const userId=req.user._id;
        const wishlistItems= await Wishlist.find({userId})
                            .populate('productId','name salesPrice isBlocked deletedAt')
                            .populate('variantId','colour images stock isBlocked deletedAt');

        const activeItems=wishlistItems.filter(item=>{
          return item.productId &&
                  item.variantId &&
                  !item.productId.isBlocked &&
                  !item.productId.deletedAt &&
                  !item.variantId.isBlocked &&
                  !item.variantId.deletedAt;
        });                    
        res.status(200).json({wishlist:activeItems})
    }
    catch(error){
        console.error(error); 
        res.status(500).json({message:"something went wrong"})
    }
}




export const renderWishlistPage = (req, res) => {
  return res.render("wishlist"); 
};

export const removeFromWishlist = async (req, res) => {
  try {
    const id = req.params.id;
    await Wishlist.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Removedd from wishlist" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to remove" });
  }
};

