const express=require('express');
const router=express.Router();
const orderController=require('../../controllers/user/orderController');
const{isLoggedIn,checkBlock}=require('../../middlewares/userAuth')

router.get('/my-order',isLoggedIn,checkBlock,orderController.getUserOrders);

router.get('/orders/:orderId',isLoggedIn,checkBlock,orderController.getOrderDetail);

router.post('/orders/:orderId/cancel',isLoggedIn,checkBlock,orderController.cancelOrder);
router.post('/orders/:orderId/item/:itemId/cancel',isLoggedIn,checkBlock,orderController.cancelOrderItem);
router.post('/orders/:orderId/item/:itemId/return',isLoggedIn,checkBlock,orderController.returnItem);
router.post('/orders/:orderId/return',isLoggedIn,checkBlock,orderController.returnOrder);

router.get('/orders/:orderId/invoice', isLoggedIn, checkBlock, orderController.downloadInvoice);
module.exports=router;

