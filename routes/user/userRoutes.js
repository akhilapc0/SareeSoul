const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user/userController');


router.get('/shop', userController.getShopPage);
router.get("/product/:productId", userController.getProductDetail);
module.exports = router;
