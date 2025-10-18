import express from 'express';

import  upload from '../../middlewares/uploadtoCloudinary.js';
import  adminAuth from '../../middlewares/adminAuth.js';
import  variantController from '../../controllers/admin/variantController.js';
import {maxImageSize} from '../../shared/constant.js';

const router=express.Router();


router.get("/products/:productId/variants", variantController.listVariants);

router.get("/products/:productId/variants/add", variantController.loadAddVariant);

router.post("/products/:productId/variants/add",upload.array("images", maxImageSize), variantController.postAddVariant);


 router.get("/products/:productId/variants/edit/:variantId", variantController.getEditVariant);


router.post("/products/:productId/variants/edit/:variantId", upload.array("images", maxImageSize), variantController.postEditVariant);

router.post("/products/:productId/variants/block/:variantId", variantController.toggleBlock);


router.delete("/products/:productId/variants/delete/:variantId", variantController.deleteVariant);

export default router;
