const express=require('express');
const router=express.Router();
const upload=require('../../middlewares/uploadtoCloudinary');
const adminAuth=require('../../middlewares/adminAuth');
const variantController=require('../../controllers/admin/variantController');



router.get("/products/:productId/variants", variantController.listVariants);

router.get("/products/:productId/variants/add", variantController.loadAddVariant);

router.post("/products/:productId/variants/add", upload.array("images", 5), variantController.postAddVariant);


 router.get("/products/:productId/variants/edit/:variantId", variantController.getEditVariant);


router.post("/products/:productId/variants/edit/:variantId", upload.array("images", 5), variantController.postEditVariant);

router.delete("/products/:productId/variants/delete/:variantId", variantController.deleteVariant);

module.exports = router;