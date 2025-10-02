const express=require('express');
const router=express.Router();
const checkoutController=require('../../controllers/user/checkoutController');
const{isLoggedIn,checkBlock}=require('../../middlewares/userAuth')


router.get('/checkout',isLoggedIn,checkBlock,checkoutController.loadCheckout);
router.post('/checkout/place-order',isLoggedIn,checkBlock,checkoutController.placeOrder);
router.get('/order-success/:id',isLoggedIn,checkBlock,checkoutController.loadOrderSuccess);


module.exports=router;