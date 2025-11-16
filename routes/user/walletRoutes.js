import express from 'express';

import {createWalletOrder,getWalletDetails, verifyWalletPayment} from '../../controllers/user/walletController.js';
import { isLoggedIn,checkBlock } from '../../middlewares/userAuth.js';

const router=express.Router();

router.get('/',isLoggedIn,checkBlock,getWalletDetails);
router.post('/create-order',isLoggedIn,checkBlock,createWalletOrder);
router.post('/verify-payment',isLoggedIn,checkBlock,verifyWalletPayment);


export default router;
