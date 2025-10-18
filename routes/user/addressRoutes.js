import express from 'express';


import  addressController from '../../controllers/user/addressController.js';
import {isLoggedIn,checkBlock} from '../../middlewares/userAuth.js';


const router = express.Router();

router.get('/my-address',isLoggedIn,checkBlock, addressController.getAddressList);

router.get('/add-address', isLoggedIn, checkBlock, addressController.getAddAddress);

router.post('/add-address', isLoggedIn, checkBlock, addressController.postAddAddress);


router.get('/edit-address/:id', isLoggedIn,checkBlock,addressController.getEditAddress);
router.post('/edit-address/:id',isLoggedIn,checkBlock, addressController.postEditAddress);

router.delete("/delete-address/:id", isLoggedIn, checkBlock, addressController.deleteAddress);

router.patch('/profile/address/:id/default', isLoggedIn, checkBlock, addressController.setDefaultAddress);


export default router;



