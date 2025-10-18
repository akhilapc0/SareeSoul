import express from 'express';
import  adminAuth from '../../middlewares/adminAuth.js';
import  categoryController from '../../controllers/admin/categoryController.js';

const router=express.Router();

router.get('/categories',adminAuth,categoryController.getCategoryList);

router.get('/categories/add',adminAuth,categoryController.loadAddCategory);
router.post('/categories/add',adminAuth,categoryController.postAddCategory);

router.get('/categories/edit/:id',adminAuth,categoryController.getEditCategory);
router.post('/categories/edit/:id',adminAuth,categoryController.postEditCategory);
router.post('/categories/toggle/:id',adminAuth,categoryController.toggleBlock);
router.delete('/categories/delete/:id',adminAuth,categoryController.deleteCategory);

export default router;
