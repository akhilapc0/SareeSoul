const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/authController');
const passport = require('passport');

// show registration form
router.get('/register', authController.getRegisterPage);

// handle form submission
router.post('/register', authController.registerUser);
router.get('/verify-otp',authController.getVerifyOtpPage);
router.post('/verify-otp',authController.verifyOtp)
router.get('/resend-otp', authController.resendOtp);


router.get('/login',authController.getLogin)
router.post('/login',authController.loginUser)

router.get('/forgot-password',authController.getForgotPasswordPage);
router.post('/forgot-password',authController.postForgotPassword);
router.get('/change-password/:email/:otp',authController.getChangePassword);
router.post('/change-password/:email/:otp',authController.postChangePassword);


router.get('/auth/google',passport.authenticate('google',{scope:['Profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect('/home')
})
//show home page
router.get('/home', authController.getHomePage);

module.exports = router;
