const Cart = require('../../models/cartModel');
const Product = require('../../models/productModel'); // your product model

// Add one variant to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user; // logged-in user
    const { productId, variantId, color, price, image } = req.body;

    // Find user's cart
    let cart = await Cart.findOne({ userId });

    // If cart doesn't exist, create new
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Add item (for now, quantity = 1)
    cart.items.push({ productId, variantId, color, quantity: 1, price, image });

    // Calculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();

    res.json({ success: true, message: 'Product added to cart', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { addToCart };
