import  express from 'express';


import  profileController from '../../controllers/user/profileController.js';
import  upload from '../../middlewares/uploadtoCloudinary.js';
import  {isLoggedIn,checkBlock} from '../../middlewares/userAuth.js';

const router = express.Router();


router.get('/profile', isLoggedIn,checkBlock, profileController.getProfilePage);

//edit personal information
router.get('/profile/edit', isLoggedIn, checkBlock, profileController.renderEditPersonal);


router.post('/profile/edit', isLoggedIn, checkBlock, upload.single('image'), profileController.updatePersonalInfo);

//edit email
router.get('/profile/change-email', isLoggedIn, checkBlock, profileController.renderChangeEmailPage);

router.post('/profile/change-email', isLoggedIn, checkBlock, profileController.requestEmailOtp);

router.get('/profile/verify-email-otp', isLoggedIn, checkBlock, profileController.renderVerifyEmailOtpPage);

router.post('/profile/verify-email-otp', isLoggedIn, checkBlock, profileController.verifyEmailOtp);

router.post('/profile/resend-email-otp',isLoggedIn,checkBlock,profileController.postResendChangeEmailOtp
);
// edit  password 
router.get('/profile/change-password', isLoggedIn, checkBlock, profileController.renderChangePasswordPage);


router.post('/profile/change-password', isLoggedIn, checkBlock, profileController.postChangePassword);



export default  router;
