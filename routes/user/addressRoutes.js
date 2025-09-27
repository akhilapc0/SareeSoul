const express = require('express');
const router = express.Router();

const addressController=require('../../controllers/user/addressController');
const{isLoggedIn,checkBlock}=require('../../middlewares/userAuth')

router.get('/my-address',isLoggedIn,checkBlock, addressController.getAddressList);

router.get('/add-address', isLoggedIn, checkBlock, addressController.getAddAddress);

router.post('/add-address', isLoggedIn, checkBlock, addressController.postAddAddress);


router.get('/edit-address/:id', isLoggedIn,checkBlock,addressController.getEditAddress);
router.post('/edit-address/:id',isLoggedIn,checkBlock, addressController.postEditAddress);

router.delete("/delete-address/:id", isLoggedIn, checkBlock, addressController.deleteAddress);

router.patch('/profile/address/:id/default', isLoggedIn, checkBlock, addressController.setDefaultAddress);


module.exports=router;



