const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/authController');
const {isLoggedIn,isLoggedOut}=require('../../middlewares/userAuth');
const passport = require('passport');

// show registration form
router.get('/register', authController.getRegisterPage);

// handle form submission
router.post('/register', authController.registerUser);
router.get('/verify-otp',authController.getVerifyOtpPage);
router.post('/verify-otp',authController.postVerifyOtp)
router.post('/resend-otp', authController.postResendOtp);


router.get('/login',isLoggedOut,authController.getLogin)
router.post('/login',authController.loginUser)

router.get('/forgot-password',authController.getForgotPasswordPage);
router.post('/forgot-password',authController.postForgotPassword);
router.get('/change-password/:email/:otp',authController.getChangePassword);
router.post('/change-password/:email/:otp',authController.postChangePassword);


router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),(req,res)=>{
    console.log("passport-session ",req.session.passport)
    res.redirect('/home')
})
//show home page
router.get('/home',isLoggedIn, authController.getHomePage);

module.exports = router;
