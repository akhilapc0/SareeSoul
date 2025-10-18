import express from 'express';

import adminAuth from '../../middlewares/adminAuth.js';
import orderController from '../../controllers/admin/orderController.js';

const router=express.Router();

router.get('/orders',adminAuth,orderController.getAllOrders);
router.get('/orders/:orderId', adminAuth,orderController.getOrderDetails);
router.patch('/orders/:orderId/items/:itemId/status',adminAuth,orderController.updateOrderItemStatus);

router.patch('/orders/:orderId/items/:itemId/request', adminAuth, orderController.handleItemRequest);

export default router;