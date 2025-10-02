const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');
const {isLoggedIn,isLoggedOut,checkBlock}=require('../../middlewares/userAuth');

router.get('/shop', checkBlock,userController.getShopPage);
router.get("/product/:productId",checkBlock, userController.getProductDetail);

module.exports=router;

