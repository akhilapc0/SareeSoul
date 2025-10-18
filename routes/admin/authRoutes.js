import express from 'express';

import  authController from '../../controllers/admin/authController.js';
import  adminAuth from '../../middlewares/adminAuth.js';
const router=express.Router();

router.get('/login',authController.getAdminLogin);
router.post('/login',authController.postAdminLogin)
router.get('/dashboard',adminAuth,authController.getDashboard);
router.get('/logout',authController.adminLogout);

export default router;