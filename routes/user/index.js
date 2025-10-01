const express=require('express');
const router=express.Router();

router.use('/', require('./cartRoutes'));      
router.use('/', require('./authRoutes'));
router.use('/', require('./addressRoutes'));
router.use('/', require('./profileRoutes'));
router.use('/', require('./userRoutes'));

module.exports=router;
