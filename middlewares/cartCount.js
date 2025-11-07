import Cart from '../models/cartModel.js';


const getCartCount = async (req, res, next) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    
    if (userId) {
      const cart = await Cart.findOne({ userId })
        .populate('items.productId')
        .populate('items.variantId');
      
      if (cart && cart.items) {
        
        const activeItems = cart.items.filter(item => {
          return item.productId && 
                 item.variantId &&
                 !item.productId.isBlocked && 
                 !item.productId.deletedAt &&
                 !item.variantId.isBlocked &&
                 !item.variantId.deletedAt;
        });
        
        res.locals.cartCount = activeItems.length;
      } else {
        res.locals.cartCount = 0;
      }
    } else {
      res.locals.cartCount = 0;
    }
    
    next();
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.locals.cartCount = 0;
    next();
  }
};

export default getCartCount;