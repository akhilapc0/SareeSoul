import express from 'express';
import { getCoupons,getAddCoupon,addCoupon,toggleCouponStatus } from '../../controllers/admin/couponController.js';

import adminAuth from '../../middlewares/adminAuth.js';

const router=express.Router();

router.get('/',adminAuth,getCoupons);

router.get('/add',adminAuth,getAddCoupon);

router.post('/add',adminAuth,addCoupon);

router.post('/toggle/:id',adminAuth,toggleCouponStatus);

export default router;


