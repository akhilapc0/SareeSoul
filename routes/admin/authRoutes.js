import express from 'express';

import  authController from '../../controllers/admin/authController.js';
const router=express.Router();

router.get('/login',authController.getAdminLogin);
router.post('/login',authController.postAdminLogin)

router.get('/',authController.hostLogin);

router.get('/logout',authController.adminLogout);

export default router;
