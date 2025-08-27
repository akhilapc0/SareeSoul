const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');
const {checkBlocked}=require('../../middlewares/userAuth')

router.get('/shop', userController.getShopPage);
router.get("/product/:productId", userController.getProductDetail);
router.get('/profile',checkBlocked,userController.getProfile)


module.exports = router;
