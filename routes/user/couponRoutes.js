import express from "express";

import { applyCoupon,removeCoupon } from "../../controllers/user/couponController.js";

import { isLoggedIn,checkBlock } from '../../middlewares/userAuth.js';

const router =express.Router();

router.post('/apply',isLoggedIn,checkBlock,applyCoupon);
router.post('/remove',isLoggedIn,checkBlock,removeCoupon);

export default router;
