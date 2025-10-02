const Cart=require('../../models/cartModel');
const User=require('../../models/userModel');
const Address=require('../../models/addressModel');
const Order=require('../../models/orderModel');
const Variant=require('../../models/variantModel');
const loadCheckout = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    const user = req.session?.user || await User.findById(userId);

    const cart = await Cart.findOne({ userId })
      .populate('items.productId')
      .populate('items.variantId');

    if (!cart || cart.items.length === 0) {
      req.flash('error_msg', 'Your cart is empty');
      return res.redirect('/cart');
    }

    // Check stock
    for (let item of cart.items) {
      if (!item.variantId || item.variantId.stock < item.quantity) {
        req.flash('error_msg', `Out of stock: ${item.productId.name}`);
        return res.redirect('/cart');
      }
    }

    const addresses = await Address.find({ userId });
    const subtotal = cart.items.reduce((sum, i) => sum + i.quantity * i.productId.salesPrice, 0);

    res.render('checkout', {
      items: cart.items,
      addresses,
      subtotal,
      user,
      error_msg: req.flash('error_msg')
    });

  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong, please try again');
    res.redirect('/cart');
  }
};

const placeOrder = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    const { addressId } = req.body;

    const cart = await Cart.findOne({ userId })
      .populate('items.productId')
      .populate('items.variantId');

    if (!cart || cart.items.length === 0) {
      req.flash('error_msg', 'Your cart is empty');
      return res.redirect('/cart');
    }

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      req.flash('error_msg', 'Please select a valid address');
      return res.redirect('/checkout');
    }

    // Check stock again before placing order
    for (let item of cart.items) {
      if (!item.variantId || item.variantId.stock < item.quantity) {
        req.flash('error_msg', `Out of stock: ${item.productId.name}`);
        return res.redirect('/cart');
      }
    }

    const subtotal = cart.items.reduce((sum, i) => sum + i.quantity * i.productId.salesPrice, 0);

    const order = new Order({
      userId,
      address: address.toObject(),
      items: cart.items.map(i => ({
        productId: i.productId._id,
        variantId: i.variantId._id,
        quantity: i.quantity,
        price: i.productId.salesPrice
      })),
      paymentMethod: 'COD',
      subtotal,
      total: subtotal,
      status: 'Pending'
    });

    await order.save();

    // Deduct stock
    for (let item of cart.items) {
      await Variant.findByIdAndUpdate(item.variantId._id, { $inc: { stock: -item.quantity } });
    }

    // Empty cart
    await Cart.findOneAndUpdate({ userId }, { items: [] });

   return res.redirect(`/order-success/${order._id}`);

  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong, please try again');
    return res.redirect('/checkout');
  }
};

const loadOrderSuccess = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session?.user?._id || req.session?.passport?.user;
    const user = req.session?.user || await User.findById(userId);

    res.render('order-success', { orderId, user });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong');
    res.redirect('/home');
  }
};


module.exports={
    loadCheckout,
    placeOrder,
    loadOrderSuccess
}