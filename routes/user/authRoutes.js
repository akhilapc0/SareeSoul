const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/authController');
const {isLoggedOut}=require('../../middlewares/userAuth');
const passport = require('passport');


router.get('/register', authController.getRegisterPage);


router.post('/register', authController.registerUser);
router.get('/verify-otp',authController.getVerifyOtpPage);
router.post('/verify-otp',authController.postVerifyOtp)
router.post('/resend-otp', authController.postResendOtp);


router.get('/login',isLoggedOut,authController.getLogin)
router.post('/login',authController.loginUser);
router.get('/logout',authController.logoutUser);

router.get('/forgot-password',authController.getForgotPasswordPage);
router.post('/forgot-password',authController.postForgotPassword);
router.get('/change-password/:email/:otp',authController.getChangePassword);
router.post('/change-password/:email/:otp',authController.postChangePassword);


router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect('/home')
})

router.get('/home', authController.getHomePage);

module.exports = router;