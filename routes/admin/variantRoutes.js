const express=require('express');
const router=express.Router();
const upload=require('../../middlewares/uploadtoCloudinary');
const adminAuth=require('../../middlewares/adminAuth');
const variantController=require('../../controllers/admin/variantController');
const {maxImageSize}=require('../../shared/constant')


router.get("/products/:productId/variants", variantController.listVariants);

router.get("/products/:productId/variants/add", variantController.loadAddVariant);

router.post("/products/:productId/variants/add", upload.array("images", maxImageSize), variantController.postAddVariant);


 router.get("/products/:productId/variants/edit/:variantId", variantController.getEditVariant);


router.post("/products/:productId/variants/edit/:variantId", upload.array("images", maxImageSize), variantController.postEditVariant);

router.delete("/products/:productId/variants/delete/:variantId", variantController.deleteVariant);

module.exports = router;