import express from 'express';

import {getWalletDetails} from '../../controllers/user/walletController.js';
import { isLoggedIn,checkBlock } from '../../middlewares/userAuth.js';

const router=express.Router();

router.get('/wallet',isLoggedIn,checkBlock,getWalletDetails);

export default router;
