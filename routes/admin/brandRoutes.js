const express=require('express');
const router=express.Router();
const adminAuth=require('../../middlewares/adminAuth');
const brandController=require('../../controllers/admin/brandController');
const uploadtoCloudinary = require("../../middlewares/uploadtoCloudinary");

router.get('/brands',adminAuth,brandController.getBrandList);

router.get('/brands/add',adminAuth,brandController.loadAddBrand);
router.post('/brands/add',adminAuth,uploadtoCloudinary.single("brandImage"),brandController.postAddBrand);

router.get('/brands/edit/:id',adminAuth,brandController.getEditBrand);
router.post('/brands/edit/:id',adminAuth,uploadtoCloudinary.single("brandImage"),brandController.postEditBrand);
router.delete('/brands/delete/:id',adminAuth,brandController.deleteBrand);

module.exports=router;