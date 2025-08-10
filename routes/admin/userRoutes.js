const express=require('express');
const router=express.Router();
const adminAuth=require('../../middlewares/adminAuth');
const userController=require('../../controllers/admin/userController');


router.get('/users',adminAuth,userController.getUserList);
router.post('/users/:id/toggle-block',adminAuth,userController.toggleUserBlockStatus);




module.exports=router;