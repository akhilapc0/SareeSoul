import  express from 'express';
import  adminAuth from '../../middlewares/adminAuth.js';
import  brandController from '../../controllers/admin/brandController.js';
import uploadtoCloudinary  from "../../middlewares/uploadtoCloudinary.js";

const router=express.Router();


router.get('/brands',adminAuth,brandController.getBrandList);

router.get('/brands/add',adminAuth,brandController.loadAddBrand);
router.post('/brands/add',adminAuth,uploadtoCloudinary.single("brandImage"),brandController.postAddBrand);

router.get('/brands/edit/:id',adminAuth,brandController.getEditBrand);
router.post('/brands/edit/:id',adminAuth,uploadtoCloudinary.single("brandImage"),brandController.postEditBrand);
router.post('/brands/toggle/:id',brandController.toggleBlock);
router.delete('/brands/delete/:id',adminAuth,brandController.deleteBrand);

export default router;