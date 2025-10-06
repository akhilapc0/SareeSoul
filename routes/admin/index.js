const express=require('express');
const router=express.Router();

router.use('/',require('./authRoutes'))
router.use('/',require('./userRoutes'))
router.use('/',require('./categoryRoutes'))
router.use('/',require('./brandRoutes'))
router.use('/',require('./productRoutes'))
router.use('/',require('./variantRoutes'))
router.use('/',require('./orderRoutes'))

module.exports=router;
