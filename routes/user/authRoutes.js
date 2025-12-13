import  express from 'express';
const router = express.Router();
import  authController from '../../controllers/user/authController.js';
import {isLoggedIn,isLoggedOut,checkBlock} from '../../middlewares/userAuth.js';
import passport from 'passport';

// show registration form
router.get('/register', authController.getRegisterPage);

// handle form submission
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
    console.log("passport-session ",req.session.passport)
    res.redirect('/home')
})

router.get('/',authController.hostHome)

router.get('/home',checkBlock, authController.getHomePage);

export default router;