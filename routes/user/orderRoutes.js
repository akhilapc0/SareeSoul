import  express from 'express';

import  orderController from '../../controllers/user/orderController.js';
import {isLoggedIn,checkBlock} from '../../middlewares/userAuth.js';

const router=express.Router();

router.get('/my-order',isLoggedIn,checkBlock,orderController.getUserOrders);

router.get('/orders/:orderId',isLoggedIn,checkBlock,orderController.getOrderDetail);

router.post('/orders/:orderId/cancel',isLoggedIn,checkBlock,orderController.cancelOrder);
router.post('/orders/:orderId/item/:itemId/cancel',isLoggedIn,checkBlock,orderController.cancelOrderItem);
router.post('/orders/:orderId/item/:itemId/return',isLoggedIn,checkBlock,orderController.returnItem);
router.post('/orders/:orderId/return',isLoggedIn,checkBlock,orderController.returnOrder);

router.get('/orders/:orderId/invoice', isLoggedIn, checkBlock, orderController.downloadInvoice);


export default router;

