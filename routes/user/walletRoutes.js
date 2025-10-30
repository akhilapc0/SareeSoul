import express from 'express';

import {addMoneyToWallet,getWalletDetails} from '../../controllers/user/walletController.js';
import { isLoggedIn,checkBlock } from '../../middlewares/userAuth.js';

const router=express.Router();

router.get('/',isLoggedIn,checkBlock,getWalletDetails);
router.post('/add-money',isLoggedIn,checkBlock,addMoneyToWallet);

export default router;
