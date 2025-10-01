const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/user/cartController');
const{isLoggedIn,checkBlock}=require('../../middlewares/userAuth')


router.get('/cart', isLoggedIn, checkBlock, cartController.loadCart);
router.post('/cart',isLoggedIn,checkBlock, cartController.addToCart);
router.post('/update-quantity',isLoggedIn,checkBlock,cartController.updateQuantity);


module.exports = router;
