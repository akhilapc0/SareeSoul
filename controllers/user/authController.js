const bcrypt = require('bcryptjs');
const User = require('../../models/userModel'); 
const sendOtpEmail=require('../../utils/sendOtpEmail')
const OtpVerification = require('../../models/otpVerificationModel');
const {EmailVerificationUsageType,ForgotPasswordUsageType}=require('../../shared/constant');
const getRegisterPage = (req, res) => {
  res.render('register', { errorEmail: "", formData: {}, errors: {} });

};



const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, cpassword } = req.body;

    const errors = {};
    const formData = { firstName, lastName, email, phoneNumber };
    if (!firstName || !/^[A-Za-z]+$/.test(firstName) || firstName.length < 3) {
      errors.firstName = "First name must be at least 3 letters, alphabets only";
    }
    if (!lastName || !/^[A-Za-z]+$/.test(lastName)) {
      errors.lastName = "Enter a valid last name";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email";
    }
    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      errors.phoneNumber = "Enter a valid 10-digit phone number";
    }
    if (!password || password.length < 6 || !/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = "Password must be 6+ chars, include a capital letter and a special character";
    }
    if (cpassword !== password) {
      errors.cpassword = "Passwords do not match";
    }

   
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errors.email = "Email is already registered";
    }

    
    if (Object.keys(errors).length > 0) {
      return res.render('register', { errors, formData });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      isVerified: false, 
    });

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); 

   
    await OtpVerification.create({
      userId: newUser._id,
      email,
      otp,
      usageType: EmailVerificationUsageType,
      expiresAt,
      isUsed: false,
    });

    
    await sendOtpEmail(email, otp, EmailVerificationUsageType);
    console.log(otp);


    return res.redirect(`/verify-otp?email=${email}`);

  } catch (err) {
    console.error(err);
    return res.render('register', {
      errors: { general: 'Something went wrong' },
      formData: req.body,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.render("verify-otp", {
        email,
        error: "Email and OTP are required",
      });
    }

 
    const otpRecord = await OtpVerification.findOne({
      email,
      usageType: EmailVerificationUsageType,
    }).sort({ createdAt: -1 }); 

    
    if (!otpRecord) {
      return res.render("verify-otp", {
        email,
        error: "No OTP request found for this email",
      });
    }

    
    if (otpRecord.expiresAt < new Date()) {
      return res.render("verify-otp", {
        email,
        error: "OTP has expired. Please resend OTP.",
      });
    }

    
    if (otpRecord.isUsed) {
      return res.render("verify-otp", {
        email,
        error: "OTP already used. Please resend OTP.",
      });
    }

    
    if (otpRecord.otp !== otp) {
      return res.render("verify-otp", {
        email,
        error: "Invalid OTP. Please try again.",
      });
    }

    
    otpRecord.isUsed = true;
    await otpRecord.save();

    
    await User.updateOne({ email }, { isVerified: true });

   
    req.session.successMessage = "Email verified successfully! You can now log in.";
    return res.redirect("/login");

  } catch (error) {
    console.error(error);
    return res.render("verify-otp", {
      email: req.body.email,
      error: "Something went wrong. Please try again.",
    });
  }
};


const getVerifyOtpPage = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.redirect('/register');
  }

  res.render('verify-otp', {
    email,
    error: "" 
  });
};
const resendOtp = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.redirect('/register'); 
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('verify-otp', {
        email,
        error: 'User not found. Please register again.'
      });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp)
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); 

    
    await OtpVerification.updateMany(
      { email, usageType: EmailVerificationUsageType, isUsed: false },
      { $set: { isUsed: true } }
    );

   
    await OtpVerification.create({
      userId: user._id,
      email,
      otp,
      usageType: EmailVerificationUsageType,
      expiresAt,
      isUsed: false,
    });

    
    await sendOtpEmail(email, otp, EmailVerificationUsageType);
    console.log(otp)
    
    return res.redirect(`/verify-otp?email=${email}`);

  } catch (err) {
    console.error(err);
    return res.render('verify-otp', {
      email: req.query.email,
      error: 'Failed to resend OTP. Try again later.'
    });
  }
};



const getLogin = async (req, res) => {
  try {

    const successMessage = req.session.successMessage;
    delete req.session.successMessage; 
    res.render('login', {
      successMessage,
      errors: {},
      formData: {}
    });


  }
  catch (error) {
    console.log(error.message)
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = {};
    const formData = { email };
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {


      errors.email = 'Enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    }
    console.log(errors)

   
    if (Object.keys(errors).length > 0) {
      return res.render('login', { errors, formData, successMessage: null });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', {
        errors: { email: 'No account found with this email' },
        formData,
        successMessage: null
      });
    }

   
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', {
        errors: { password: 'Incorrect password' },
        formData,
        successMessage: null
      });
    }
     

     if (!user.isVerified) {
  return res.redirect(`/verify-otp?email=${email}`)
}

     

    req.session.user = user; 
    res.render('login', {
      errors: {},
      formData: {},
      successMessage: 'Login successful!'
    });   
  } catch (error) {
    console.log(error.message);
    res.render('login', {
      errors: { general: 'Something went wrong. Please try again.' },
      formData: req.body,
      successMessage: null
    });
  }
};

const getForgotPasswordPage=async(req,res)=>{
    res.render('forgot-password',{error:"",message:"",success:""})
}

const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;


    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.render('forgot-password', { error: 'Enter a valid email', success: '' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('forgot-password', { error: 'No account found with this email', success: '' });
    }

  
    const existingOtp = await OtpVerification.findOne({
      email,
      usageType: ForgotPasswordUsageType,
      expiresAt: { $gt: new Date() },
      isUsed: false
    });

    let otp;
    if (existingOtp) {
      // Calculate remaining time in seconds
      const remainingMs = new Date(existingOtp.expiresAt) - new Date();
      const remainingSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;

      return res.render('forgot-password', {
        error: `An OTP was already sent. Please try again after ${minutes}m ${seconds}s.`,
        success: ''
      });
    }
    else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      await OtpVerification.deleteMany({ email, usageType: ForgotPasswordUsageType });

      await OtpVerification.create({
        userId: user._id,
        email,
        otp,
        usageType: ForgotPasswordUsageType,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        isUsed: false
      });
    }

    const resetLink = `${process.env.BASE_URL}/change-password/${encodeURIComponent(email)}/${otp}`;

    
    await sendOtpEmail(email, otp, ForgotPasswordUsageType);


    return res.render('forgot-password', {
      error: '',
      success: 'Password reset link sent to your email.'
    });

  } catch (err) {
    console.error(err);
    return res.render('forgot-password', { error: 'Something went wrong.', success: '' });
  }
};

// GET /change-password/:email/:otp
const getChangePassword = async (req, res) => {
  const { email, otp } = req.params;

  // check OTP validity
  const otpDoc = await OtpVerification.findOne({
    email,
    otp,
    usageType: ForgotPasswordUsageType,
    expiresAt: { $gt: new Date() },
    isUsed: false
  });

  if (!otpDoc) {
    return res.send('Invalid or expired link');
  }

  res.render('change-password', { email, otp, error: '', success: '' });
};





const postChangePassword = async (req, res) => {
  const { email, otp } = req.params;
  const { newPassword, confirmPassword } = req.body;

  console.log(newPassword,confirmPassword)

  if (newPassword !== confirmPassword) {
    return res.render('change-password', { email, otp, error: 'Passwords do not match', success: '' });
  }

  const otpDoc = await OtpVerification.findOne({
    email,
    otp,
    expiresAt: { $gt: new Date() },
    isUsed: false
  });

  if (!otpDoc) {
    return res.send('Invalid or expired link');
  }

  // update password
  const hashed = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ email }, { password: hashed });

  // mark OTP used
  otpDoc.isUsed = true;
  await otpDoc.save();

   res.render('change-password', {
    email: '',
    otp: '',
    error: '',
    success: 'Password changed successfully'
  });
};



const getHomePage = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('home', { user: req.session.user });
};


module.exports = {
  getRegisterPage,
  registerUser,
  verifyOtp,
  getVerifyOtpPage,
  resendOtp,
  getLogin,
  loginUser,
  getHomePage,
  getForgotPasswordPage,
  postForgotPassword,
  getChangePassword,
  getChangePassword,
  postChangePassword
};


