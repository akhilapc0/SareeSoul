const express=require('express');
const router=express.Router();
const adminAuth=require('../../middlewares/adminAuth');
const orderController=require('../../controllers/admin/orderController');
router.get('/orders',adminAuth,orderController.getAllOrders);
router.get('/orders/:orderId', adminAuth,orderController.getOrderDetails);
router.patch('/orders/:orderId/items/:itemId/status',adminAuth,orderController.updateOrderItemStatus);

router.patch('/orders/:orderId/items/:itemId/request', adminAuth, orderController.handleItemRequest);

module.exports=router;