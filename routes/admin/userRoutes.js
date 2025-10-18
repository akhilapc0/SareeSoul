import  express from 'express';

import  adminAuth from'../../middlewares/adminAuth.js';
import userController from '../../controllers/admin/userController.js';
const router=express.Router();


router.get('/users',adminAuth,userController.getUserList);
router.post('/users/:id/toggle-block',adminAuth,userController.toggleUserBlockStatus);




export default router;