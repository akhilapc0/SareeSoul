import express from 'express';

import  checkoutController from '../../controllers/user/checkoutController.js';
import {isLoggedIn,checkBlock} from '../../middlewares/userAuth.js';

const router=express.Router();

router.get('/checkout',isLoggedIn,checkBlock,checkoutController.loadCheckout);
router.post('/checkout/place-order',isLoggedIn,checkBlock,checkoutController.placeOrder);
router.post('/checkout/verify-payment',isLoggedIn,checkBlock,checkoutController.verifyPayment);
router.get('/order-success/:id',isLoggedIn,checkBlock,checkoutController.loadOrderSuccess);
router.get('/payment-failed',isLoggedIn,checkBlock,checkoutController.loadPaymentFailed);

export default router;
