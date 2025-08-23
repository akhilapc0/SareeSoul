const bcrypt = require('bcryptjs');
const User = require('../../models/userModel'); 
const sendOtpEmail=require('../../utils/sendOtpEmail')
const OtpVerification = require('../../models/otpVerificationModel');
const {EmailVerificationUsageType,ForgotPasswordUsageType}=require('../../shared/constant');
const {registerValidation}=require('../../validator/schema');
const getRegisterPage = (req, res) => {
  res.render('register', { errorEmail: "", formData: {}, errors: {} });

};



const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;

    // 2️⃣ Validate input
    const { error } = registerValidation.validate(req.body, { abortEarly: false });
    if (error) {
      // Convert Joi error details into { fieldName: message }
      const errors = {};
      error.details.forEach(err => {
        errors[err.path[0]] = err.message;
      });

      return res.render("register", {
        errors,
        formData: { firstName, lastName, email, phoneNumber }
      });
    }

    // 3️⃣ Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", {
        errors: { email: "Email is already registered" },
        formData: { firstName, lastName, email, phoneNumber }
      });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      isVerified: false
    });

    // 6️⃣ Create OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await OtpVerification.create({
      userId: newUser._id,
      email,
      otp,
      usageType: EmailVerificationUsageType,
      expiresAt,
      isUsed: false
    });

    //  Send OTP email
    await sendOtpEmail(email, otp, EmailVerificationUsageType);
    console.log("OTP sent:", otp);

    // Redirect to OTP verification page
    return res.redirect(`/verify-otp?email=${email}`);

  } catch (err) {
    console.error(err);
    return res.render("register", {
      errors: { general: "Something went wrong" },
      formData: req.body
    });
  }
};

const postVerifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const otpDoc = await OtpVerification.findOne({
    email,
    isUsed: false,
    usageType: EmailVerificationUsageType,
    expiresAt: { $gt: Date.now() }
  });

  if (!otpDoc) {
    return res.json({ success: false, message: "OTP not found or expired. Please request a new one." });
  }

  if (otpDoc.otp != otp) {
    return res.json({ success: false, message: "Invalid OTP" });
  }

  // ✅ Mark OTP as used
  otpDoc.isUsed = true;
  await otpDoc.save();

  const user=await User.findOne({email});
  user.isVerified=true;
  await user.save();

  // ✅ Continue registration flow
  return res.json({ success: true, message: "OTP verified successfully!" });
};


const getVerifyOtpPage = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.redirect('/register');
  }

  // find otp for this email
  const otpDoc = await OtpVerification.findOne({
  email,
  isUsed: false,
  usageType: EmailVerificationUsageType,
  expiresAt: { $gt: Date.now() }   // only OTPs that haven’t expired
});

  let timeRemaining = 0;

  if (otpDoc) {
    const now = Date.now();
    const expiry = new Date(otpDoc.expiresAt).getTime();
    timeRemaining = expiry > now ? Math.floor((expiry - now) / 1000) : 0;
  }

  res.render("verify-otp", {
    email,
    error: "",
    timeRemaining   // pass seconds to EJS
  });
};



const postResendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('verify-otp', {
        email,
        message: "User not found",
        timeRemaining: 0
      });
    }

    // generate new otp (4 digit)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // expiry: 1 minute from now
    const expiresAt = Date.now() + 60 * 1000;

    // ❌ instead of deleteOne
    // ✅ delete all previous OTPs for this email
    await OtpVerification.deleteMany({ email });

    // save new otp
    await OtpVerification.create({
      userId: user._id,
      usageType: EmailVerificationUsageType,
      email,
      otp,
      expiresAt
    });

    // send via email
    await sendOtpEmail(email, otp);
     console.log(otp)

    return res.redirect(`/verify-otp?email=${email}`)
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.render("verify-otp", {
      email: req.body.email,
      error: "Something went wrong, please try again.",
      timeRemaining: 0
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

const logoutUser = async(req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid'); 
    res.redirect('/home');
  });
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
  res.render('home', { user: req.session.user || null });
};


module.exports = {
  getRegisterPage,
  registerUser,
  postVerifyOtp,
  getVerifyOtpPage,
  postResendOtp,
  getLogin,
  loginUser,
  getHomePage,
  logoutUser,
  getForgotPasswordPage,
  postForgotPassword,
  getChangePassword,
  getChangePassword,
  postChangePassword
};


