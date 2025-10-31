import  Cart from '../../models/cartModel.js';
import  User from '../../models/userModel.js';
import Address from '../../models/addressModel.js';
import  Order from '../../models/orderModel.js';
import Variant from '../../models/variantModel.js';
import Counter from '../../models/counterModel.js';
import razorpayInstance from '../../utils/razorpay.js';
import Coupon from '../../models/couponModel.js'
import crypto from "crypto";
import Wallet from '../../models/walletModel.js';
import offerController from '../admin/offerController.js';


const loadCheckout = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    const user = req.session?.user || await User.findById(userId);

    const cart = await Cart.findOne({ userId })
      .populate({
        path:'items.productId',
        populate:{path:'categoryId'}
      })
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
    
    let originalSubtotal=0;
    let offerSubtotal =0;
    let totalOfferSavings=0;

    const itemsWithOffers=cart.items.map(item=>{
      const{offerPrice,discount,hasOffer}=offerController.calculateOfferPrice(
        item.productId,
        item.productId.categoryId
      );

      const itemOriginalPrice=item.quantity * item.productId.salesPrice;
      const itemOfferPrice=item.quantity * Math.round(offerPrice);
      const itemSavings=hasOffer ?(itemOriginalPrice-itemOfferPrice) : 0;

      originalSubtotal +=itemOriginalPrice;
      offerSubtotal +=itemOfferPrice;
      totalOfferSavings +=itemSavings;

      return {
        ...item.toObject(),
        offerPrice:Math.round(offerPrice),
        discount,
        hasOffer,
        itemTotal:itemOfferPrice,
        itemOriginalTotal:itemOfferPrice,
        itemOriginalTotal:itemOriginalPrice
      }


    });


    const wallet=await Wallet.findOne({userId});
    const walletBalance=wallet ? wallet.balance : 0;

    const availableCoupons =await Coupon.find({
          isActive: true,
          validityDate:{$gt: new Date()},
          $expr:{$lt :["$usedCount","$usageLimit"]},
          minCartAmount:{$lte: offerSubtotal},
          usedBy:{$nin:[userId]},


    }).sort({ discountValue :-1});


    res.render('checkout', {
      items: itemsWithOffers,
      addresses,
      subtotal:offerSubtotal,
      originalSubtotal:originalSubtotal,
      offerSavings:totalOfferSavings,
      user,
      availableCoupons,
      walletBalance,
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
    const { addressId,paymentMethod } = req.body;

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

    for (let item of cart.items) {
      if (!item.variantId || item.variantId.stock < item.quantity) {
        req.flash('error_msg', `Out of stock: ${item.productId.name}`);
        return res.redirect('/cart');
      }
    }

    const subtotal = cart.items.reduce((sum, i) => sum + i.quantity * i.productId.salesPrice, 0);

    let discount = 0;
    let couponId =null;

    if(req.session.appliedCoupon){
      discount =req.session.appliedCoupon.discountAmount;
      couponId=req.session.appliedCoupon.couponId;
    }

    const total = subtotal - discount ;

    const counter=await Counter.findOneAndUpdate(
      {id:'Order'},
      {$inc:{seq:1}},
      {new:true,upsert:true}
    )
    const totalAmount= total*100;

    if(paymentMethod === "Razorpay"){
          const options={
            amount:totalAmount,
            currency:"INR",
            receipt:`order_${counter.seq}`
          }
    

  const razorpayOrder=await razorpayInstance.orders.create(options);

  return res.json({
    success:true,
    key:process.env.RAZORPAY_KEY_ID,
    amount:totalAmount,
    razorpayOrderId:razorpayOrder.id,
    orderId:`ORD-${counter.seq}`
  });

    }

    if(paymentMethod ==='Wallet'){

      
      const wallet = await Wallet.findOne({userId});

      if(!wallet ||wallet.balance < total){
        return res.json({
          success:false,
          message:"Insufficient wallet balance"
        });
      }
      wallet.balance -=total;

      wallet.transactions.push({type:'Debit',amount:total,
        reason:'Order placed using wallet',createdAt: new Date()
      });

      await wallet.save();

      const order=new Order({
        orderId:`ORD-${counter.seq}`,
        userId,
        address:address.toObject(),
        items:cart.items.map(i=>({
          productId:i.productId._id,
          variantId:i.variantId._id,
          quantity:i.quantity,
          price:i.productId.salesPrice
        })),
        paymentMethod:'Wallet',
        subtotal,
        discount,
        total,
        status:'Pending',
        paymentStatus:'Paid'

      });

      await order.save();

      if(couponId){
        await Coupon.findByIdAndUpdate(couponId,{
          $addToSet:{usedBy:userId},$inc:{usedCount:1}
        });
        delete req.session.appliedCoupon
      }
      for(let item of cart.items){
        await Variant.findByIdAndUpdate(item.variantId._id,{
          $inc:{stock:-item.quantity}
        })
      }

      await Cart.findOneAndUpdate({userId},{items:[]})
      return res.json({
        success:true,
        message:"order placed successfully using wallet",
        redirectUrl:`/order-success/${order.orderId}`
      });

    }




    if(paymentMethod === 'COD')
    {
    const order = new Order({
      orderId:`ORD-${counter.seq}`,
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
      discount,
      total,
      status: 'Pending'
    });

    await order.save();

    if(couponId){
      await Coupon.findByIdAndUpdate(couponId,{
        $addToSet:{ usedBy :userId },
        $inc:{usedCount: 1}
      });
      delete req.session.appliedCoupon;
    }
    
    for (let item of cart.items) {
      await Variant.findByIdAndUpdate(item.variantId._id, { $inc: { stock: -item.quantity } });
    }

    await Cart.findOneAndUpdate({ userId }, { items: [] });

   return res.redirect(`/order-success/${order.orderId}`);
  }
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

    console.log('loadOrderSuccess called');
    console.log('orderId from params:',orderId);
    console.log('userId:',userId);

    const user = req.session?.user || await User.findById(userId);
    const order=await Order.findOne({orderId});

    console.log('order found:',order ?'yes':'no');
    if(order){
      console.log('order details:',{
        orderId:order.orderId,
        paymentMethod:order.paymentMethod,
        paymentStatus:order.paymentStatus,
        status:order.status
      })
    }
    if(!order){
      console.log('order not found,redirecting to shop')
      req.flash('error_msg','order not found');
      return res.redirect('/shop')
    }
    if(order.paymentMethod === 'Razorpay' && order.paymentStatus !=='Paid'){
      console.log('payment not completed ,redirecting to checkout')
      req.flash('error_msg','Payment not completed');
      return res.redirect('/checkout')
    }

    console.log('Rendering order-success page')
    res.render('order-success', { order, user,orderId:order.orderId });
  } catch (err) {
    console.error(`error in loadOrderSuccess:`,err);
    req.flash('error_msg', 'Something went wrong');
   return  res.redirect('/checkout');
  }
};

const verifyPayment=async(req,res)=>{
  try{
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      addressId
    }=req.body;

    console.log(" Payment Verification Started");
    console.log("Razorpay IDs:", razorpay_order_id, razorpay_payment_id);
    console.log("Signature from Razorpay:", razorpay_signature);


    const generated_signature=crypto
      .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|"+ razorpay_payment_id)
      .digest("hex");
    
     console.log("Generated Signature:", generated_signature);

      if(generated_signature !== razorpay_signature){

             console.log(" Signature mismatch");

        return res.json({success:false,message:"Invalid signature"})
      }
         console.log(" Signature verified successfully");

      const userId=req.session?.user?._id || req.session?.passport?.user;

      const cart=await Cart.findOne({userId})
                  .populate('items.productId')
                  .populate('items.variantId')

      if(!cart || cart.items.length === 0){
        console.log(" Cart empty");
        return res.json({success:false,message:"cart is empty"})
      }

      const address=await Address.findOne({_id:addressId,userId})
      if(!address){
        console.log(" Invalid address");
        return res.json({success:false,message:"Invalid address"})
      }

      const subtotal=cart.items.reduce(
        (sum,i)=> sum + i.quantity * i.productId.salesPrice,
        0
      )

      let discount = 0;
      let couponId =null;

      if(req.session.appliedCoupon){
        discount = req.session.appliedCoupon.discountAmount;
        couponId = req.session.appliedCoupon.couponId;
        console.log(' Coupon found in session:',req.session.appliedCoupon.code);
      }

      const total = subtotal -discount;

      const order = new Order({
        orderId,
        userId,
        address:address.toObject(),
        items:cart.items.map((i)=>({
          productId:i.productId._id,
          variantId:i.variantId._id,
          quantity:i.quantity,
          price:i.productId.salesPrice
        })),
        paymentMethod:'Razorpay',
        paymentId:razorpay_payment_id,
        subtotal,
        discount,
        total,
        status:'Pending',
        paymentStatus:'Paid'
      });

      await order.save();

      console.log(" Order saved:", order.orderId);

      if(couponId){
        await Coupon.findByIdAndUpdate(couponId,{
          $addToSet:{usedBy:userId},
          $inc:{usedCount:1}
        });
        delete req.session.appliedCoupon;
        console.log('Coupon  marked as used cleared from session')
      }



      for(let item of cart.items){
        await Variant.findByIdAndUpdate(item.variantId._id,{
          $inc:{ stock: -item.quantity}
        })
      }

      console.log(" Stock updated");

      await Cart.findOneAndUpdate({userId},{items:[]});

          console.log(" Cart cleared");

        const redirectUrl=`/order-success/${order.orderId}`;
        console.log("sending response with redirectUrl:",redirectUrl)

        return res.status(200).json({
          success:true,
          redirectUrl:redirectUrl
        })
      

  }
  catch(err){
  console.error('verifyPayment error:',err);
  return res.status(500).json({success:false,message:"something went wrong"})
}
}

const loadPaymentFailed=async(req,res)=>{
  try{

    const userId=req.session?.user?._id || req.session?.passport?.user;
    const user=req.session?.user || await User.findById(userId)
    const orderId =req.query.orderId;
    const reason=req.query.reason || 'Payment was not completed';
    res.render('payment-failed',{
      user,
      orderId,
      reason,
      error_msg :req.flash('error_msg')
    })
  }
  catch(err){
    console.error(err);
    res.redirect('/cart')
  }
}


const checkoutController={
    loadCheckout,
    placeOrder,
    loadOrderSuccess,
    verifyPayment,
    loadPaymentFailed
}

export default checkoutController;