import Cart from '../../models/cartModel.js';
import  Product from '../../models/productModel.js';
import  Variant from '../../models/variantModel.js';
import Wishlist from '../../models/wishlistModel.js';
import User from '../../models/userModel.js';
import offerController from '../admin/offerController.js';




const loadCart = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    if (!userId) return res.redirect('/login');

    const user = req.session?.user || await User.findById(userId);
   
    const page=parseInt(req.query.page) || 1;
    const limit=parseInt(req.query.limit) ||5;
    const skip=(page-1)*limit;

    const cart = await Cart.findOne({ userId })
    
      .populate({
        path: 'items.productId',
        populate: { path: 'categoryId' },
        select: 'name description actualPrice salesPrice categoryId brandId isBlocked deletedAt offer'
      })
      .populate({
        path: 'items.variantId',
        select: 'colour stock images isBlocked deletedAt'
      });


     

    if(!cart || !cart.items || cart.items.length ===0){
      return res.render('cart',{
        items:[],
        originalSubtotal:'0.00',
        offerSubtotal:'0.00',
        totalSavings:'0.00',
        user,
        currentPage:1,
        totalPages:0,
        totalItems:0,
        hasNextPage:false,
        hasPrevPage:false

      })
    }
    

    const validItems = cart.items
      .filter(item => {
      return item.productId &&
             item.variantId &&
            !item.productId.isBlocked && 
            !item.productId.deletedAt &&
            !item.variantId.isBlocked &&
            !item.variantId.deletedAt;
  })
  .reverse();

  const totalItems=validItems.length;
  const totalPages=Math.ceil(totalItems/limit);
  const paginatedItems=validItems.slice(skip,skip+limit)

let originalSubtotal=0;
let offerSubtotal=0;
let totalSavings=0;

validItems.forEach(item=>{
  const {offerPrice,discount,hasOffer}=offerController.calculateOfferPrice(
    item.productId,
    item.productId.categoryId
  );

  const itemOriginalPrice=item.quantity *item.productId.salesPrice;
  const itemOfferPrice=item.quantity*Math.round(offerPrice);
  const itemSavings=hasOffer?(itemOriginalPrice-itemOfferPrice):0;

  originalSubtotal +=itemOriginalPrice;
  offerSubtotal +=itemOfferPrice;
  totalSavings  +=itemSavings;

});

const itemsWithOffers=paginatedItems.map(item=>{
  const {offerPrice,discount,hasOffer}=offerController.calculateOfferPrice(
    item.productId,
    item.productId.categoryId
  )

  const itemOriginalPrice=item.quantity *item.productId.salesPrice;
  const itemOfferPrice=item.quantity *Math.round(offerPrice);
  const itemSavings=hasOffer?(itemOriginalPrice-itemOfferPrice):0;

  return {
    productId:item.productId,
    variantId:item.variantId,
    quantity:item.quantity,
    offerPrice:Math.round(offerPrice),
    discount,
    hasOffer,
    itemTotal:itemOfferPrice,
    itemOriginalTotal:itemOriginalPrice,
    itemSavings
  }

});

res.render('cart',{
  items:itemsWithOffers,
  originalSubtotal:originalSubtotal.toFixed(2),
  offerSubtotal:offerSubtotal.toFixed(2),
  totalSavings:totalSavings.toFixed(2),
  user,
  currentPage:page,
  totalPages,
  totalItems,
  hasNextPage:page < totalPages,
  hasPrevPage:page >1,
  limit
})



  } catch (err) {
    console.error('Error loading cart:',err);
    res.status(500).send('Server error');
  }
};



const addToCart = async (req, res) => {
  
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user; 
    if (!userId) return res.status(401).json({ message: 'Login required' });

    const { productId, variantId, quantity } = req.body;
    const qty = parseInt(quantity, 10) || 1;

    
    const product = await Product.findById(productId)
    .populate('categoryId')
    .populate('brandId')
    if (!product || product.deletedAt || product.isBlocked) return res.status(400).json({ message: 'Product not available' });

    if(product.categoryId?.isBlocked || product.categoryId?.deletedAt){
      return res.status(400).json({message:"category not available"})

    }
    if(product.brandId?.isBlocked || product.brandId?.deletedAt){
      return res.status(400).json({message:"brand not available"})
    }

    const variant = await Variant.findById(variantId);
    if (!variant || variant.deletedAt || variant.isBlocked) return res.status(400).json({ message: 'Variant not available' });
    if (variant.stock < qty) return res.status(400).json({ message: 'Not enough stock' });
    if(variant.stock===0){
      return res.status(400).json({message:"this product is out of stock"})
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) cart = new Cart({ userId, items: [] });

    
    const existingItem = cart.items.find(item => item.variantId.toString() === variantId.toString());

     console.log(existingItem);

    if (existingItem) {
      
      if (existingItem.quantity + qty > variant.stock) {
        return res.status(400).json({ message: 'Not enough stock to increase quantity' });
      }
     else if (existingItem.quantity + qty > 5) {
      
        return res.status(400).json({ message: 'only 5 items allowed per variant' });
      }
      existingItem.quantity += qty;
    } else {
      cart.items.push({ productId, variantId, quantity: qty });
    }

    await cart.save();
    
    await Wishlist.deleteOne({userId,variantId})
    return res.status(200).json({ message: 'Added to cart', cart });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateQuantity=async(req,res)=>{
  try{
    const userId=req.session?.user?._id || req.session?.passport?.user;
    if(!userId) return res.status(400).json({message:"login required"});
    
  
  const {variantId,action}=req.body;
  const MAX_LIMIT=5;
  let cart=await Cart.findOne({userId});
  if(!cart){
    return res.status(400).json({message:"cart not found"})
  }

const item=cart.items.find(i=>i.variantId.toString()===variantId.toString());
if(!item){
  return res.status(400).json({message:"item not in cart"})
}

if(action==="increment"){
  const variant=await Variant.findById(variantId);
  if(!variant){
    return res.status(400).json({message:"variant not found"})
  }
  if(item.quantity + 1 > variant.stock){
    return res.status(400).json({message:"not enough stock"})
  }
  if(item.quantity + 1 >MAX_LIMIT){
    return res.status(400).json({message:`Maximum ${MAX_LIMIT} per product allowed`})
  }
  item.quantity += 1;
}
if(action==="decrement"){
  if(item.quantity > 1){
    item.quantity -= 1;
  }else{
    return res.status(400).json({message:"Minimum quantity is 1"})
  }
}
await cart.save();
return res.status(200).json({message:"quantity updated ",cart})
}catch(err){
  return res.status(500).json({message:"server error"})
}


}

const removeCartItem=async(req,res)=>{
  
  try{

  const userId=req.session?.user?._id || req.session?.passport?.user;
  const {variantId}=req.params;

  const result=await Cart.updateOne(
    {userId},
    {$pull:{items:{variantId}}}
  );

if(result.modifiedCount === 0){
  return res.status(400).json({message:"Item not found in cart"})
}

res.status(200).json({message:"Item removed successfully"})

}
catch(error){
  console.error(error);
  res.status(500).json({message:"server error"})
}
}
const cartController={
  loadCart,
  addToCart,
  updateQuantity,
  removeCartItem,
  

}

export default cartController;