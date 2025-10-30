import  express from 'express';


import cartRoutes from './cartRoutes.js';
import authRoutes from './authRoutes.js';
import addressRoutes from './addressRoutes.js';
import profileRoutes from './profileRoutes.js';

import userRoutes from './userRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import orderRoutes from './orderRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import walletRoutes from './walletRoutes.js';
import couponRoutes from './couponRoutes.js';

const router=express.Router();

router.use('/',cartRoutes);
router.use('/',authRoutes);
router.use('/',addressRoutes);
router.use('/',profileRoutes);
router.use('/',userRoutes);
router.use('/',checkoutRoutes);
router.use('/',orderRoutes);
router.use('/',wishlistRoutes);
router.use('/wallet',walletRoutes);
router.use('/coupon',couponRoutes);

export default router;
