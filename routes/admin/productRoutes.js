const express=require('express');
const router=express.Router();
const adminAuth=require('../../middlewares/adminAuth');
const productController=require('../../controllers/admin/productController');

router.get("/products",productController.getProducts);

 router.get('/products',adminAuth,productController.loadProductList);

router.get('/products/add',adminAuth,productController.loadAddProduct);
router.post('/products/add',adminAuth,productController.postAddProduct);

router.get('/products/edit/:id',adminAuth,productController.getEditProduct);
router.put('/products/edit/:id',adminAuth,productController.postEditProduct);
router.delete('/products/delete/:id',adminAuth,productController.deleteProduct);

module.exports=router;