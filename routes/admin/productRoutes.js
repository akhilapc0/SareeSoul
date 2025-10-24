import  express from 'express';

import adminAuth from '../../middlewares/adminAuth.js';
import  productController from '../../controllers/admin/productController.js';

const router=express.Router();


router.get('/variant-count',adminAuth,productController.countVariants)

 router.get('/products',adminAuth,productController.loadProductList);

router.get('/products/add',adminAuth,productController.loadAddProduct);
router.post('/products/add',adminAuth,productController.postAddProduct);

router.get('/products/edit/:id',adminAuth,productController.getEditProduct);
router.put('/products/edit/:id',adminAuth,productController.postEditProduct);

router.post('/products/block/:id',adminAuth,productController.toggleBlock);

router.delete('/products/delete/:id',adminAuth,productController.deleteProduct);





export default router;