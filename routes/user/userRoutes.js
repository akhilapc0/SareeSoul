import  express from 'express';

import  userController from '../../controllers/user/userController.js';
import  {isLoggedIn,isLoggedOut,checkBlock} from '../../middlewares/userAuth.js';

const router=express.Router();

router.get('/shop', checkBlock,userController.getShopPage);
router.get("/product/:productId",checkBlock, userController.getProductDetail);

export default router;

