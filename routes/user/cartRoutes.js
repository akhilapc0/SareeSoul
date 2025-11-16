import  express  from 'express';

import cartController from '../../controllers/user/cartController.js';
import { isLoggedIn, checkBlock } from '../../middlewares/userAuth.js';


const router = express.Router();


router.get('/cart', isLoggedIn, checkBlock, cartController.loadCart);
router.post('/cart', isLoggedIn, checkBlock, cartController.addToCart);
router.post('/update-quantity',isLoggedIn,checkBlock,cartController.updateQuantity);
router.delete('/remove/:variantId',isLoggedIn,checkBlock, cartController.removeCartItem);



export default router;

