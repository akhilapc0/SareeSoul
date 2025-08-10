const express=require('express');
const router=express.Router();
const adminController=require('../../controllers/admin/authController');
const adminAuth=require('../../middlewares/adminAuth');


router.get('/login',adminController.getAdminLogin);
router.post('/login',adminController.postAdminLogin)
router.get('/dashboard',adminAuth,adminController.getDashboard);

module.exports=router;