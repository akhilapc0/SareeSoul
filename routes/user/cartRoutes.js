const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/user/cartController');
const{isLoggedIn,checkBlock}=require('../../middlewares/userAuth')


router.post('/add',isLoggedIn,checkBlock, cartController.addToCart);

module.exports = router;
