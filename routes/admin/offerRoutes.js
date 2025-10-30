import express from 'express';
import offerController from "../../controllers/admin/offerController.js";
import adminAuth from '../../middlewares/adminAuth.js';
const  router=express.Router();

router.post('/product/add-offer/:productId',adminAuth,offerController.addProductOffer);

router.delete('/product/remove-offer/:productId',adminAuth,offerController.removeProductOffer);


router.post('/category/add-offer/:categoryId',adminAuth,offerController.addCategoryOffer);
router.delete('/category/remove-offer/:categoryId',offerController.removeCategoryOffer);

export default router;
