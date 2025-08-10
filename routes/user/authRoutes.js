const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/authController');

// show registration form
router.get('/register', authController.getRegisterPage);

// handle form submission
router.post('/register', authController.registerUser);
router.get('/verify-otp',authController.getVerifyOtpPage);
router.post('/verify-otp',authController.verifyOtp)
router.get('/resend-otp', authController.resendOtp);


router.get('/login',authController.getLogin)
router.post('/login',authController.loginUser)

//show home page
router.get('/home', authController.getHomePage);

module.exports = router;
