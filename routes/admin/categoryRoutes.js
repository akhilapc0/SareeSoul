const express=require('express');
const router=express.Router();
const adminAuth=require('../../middlewares/adminAuth');
const categoryController=require('../../controllers/admin/categoryController');

router.get('/categories',adminAuth,categoryController.getCategoryList);

router.get('/categories/add',adminAuth,categoryController.loadAddCategory);
router.post('/categories/add',adminAuth,categoryController.postAddCategory);

router.get('/categories/edit/:id',adminAuth,categoryController.getEditCategory);
router.post('/categories/edit/:id',adminAuth,categoryController.postEditCategory);
router.delete('/categories/delete/:id',adminAuth,categoryController.deleteCategory);

module.exports=router;