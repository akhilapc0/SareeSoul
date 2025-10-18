import express from'express';


import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import brandRoutes from './brandRoutes.js';
import variantRoutes from './variantRoutes.js';
import orderRoutes from './orderRoutes.js';
import productRoutes from './productRoutes.js'
import userRoutes from './userRoutes.js'



const router=express.Router();

router.use('/',authRoutes);
router.use('/',categoryRoutes);
router.use('/',brandRoutes);
router.use('/',variantRoutes);
router.use('/',orderRoutes);
router.use('/',productRoutes);
router.use('/',userRoutes);


export default router;
