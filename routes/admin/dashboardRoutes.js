import express from 'express';
import dashboardController from '../../controllers/admin/dashboardController.js';
import adminAuth from '../../middlewares/adminAuth.js';

const router = express.Router();

router.get('/dashboard', adminAuth, dashboardController.getDashboard);

export default router;