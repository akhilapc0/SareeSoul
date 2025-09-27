const User = require('../../models/userModel');
const bcrypt=require("bcryptjs")
const {personalInfoValidation,requestEmailOtpValidation,verifyEmailOtpValidation,changePasswordValidation}=require('../../validator/schema')

const OtpVerification = require('../../models/otpVerificationModel');
const sendOtpEmail = require('../../utils/sendOtpEmail');
const { EditEmailUsageType } = require('../../shared/constant');

const getProfilePage = async (req, res) => {
  try {
    const userId = req.session.user?._id || req.session.passport?.user;
    const user = await User.findById(userId);
    res.render('profile', { user });
  } catch (error) {
    console.error(error);
    res.redirect('/login');
  }
};

const renderEditPersonal = async (req, res) => {
  try {
    const userId = req.session.user?._id || req.session.passport?.user;
    const user = await User.findById(userId);
    res.render('edit-personal-info', { user, errors:{}});
  } catch (error) {
    console.error(error);
    res.redirect('/profile');
  }
};

const updatePersonalInfo = async (req, res) => {
  try {
    const userId = req.session.user?._id || req.session.passport?.user;

    // validate input
    const { error, value } = personalInfoValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      return res.status(400).json({ success: false, errors });
    }

    let updateData = {
      firstName: value.firstName,
      lastName: value.lastName,
      phoneNumber: value.phoneNumber,
    };

    if (req.file && req.file.path) {
      updateData.image = req.file.path;
    }

    await User.findByIdAndUpdate(userId, updateData);

    return res.json({ success: true, message: "Updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const renderChangeEmailPage = async (req, res) => {
  try {
    const userId = req.session.user?._id || req.session.passport?.user;
    const user = await User.findById(userId);

    res.render('change-email', { user, errors: {} });
  } catch (err) {
    console.error(err);
    res.redirect('/profile');
  }
};


const requestEmailOtp = async (req, res) => {
  try {
    
    const { error } = requestEmailOtpValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      return res.status(400).json({ success: false, errors });
    }

    const { newEmail } = req.body;
    const userId = req.session.user?._id || req.session.passport?.user;

    
    const existing = await User.findOne({ email: newEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        errors: { newEmail: 'Email already in use' },
      });
    }

    // Remove old unused OTPs for this user + usage type
    await OtpVerification.deleteMany({ userId, usageType: EditEmailUsageType, isUsed: false });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Save OTP
    await OtpVerification.create({
      userId,
      email: newEmail,
      otp,
      usageType: EditEmailUsageType,
      expiresAt,
      isUsed: false,
    });
    console.log("otp:",otp);
    // Send OTP email
    await sendOtpEmail(newEmail, otp, EditEmailUsageType);

    return res.json({ success: true, message: 'OTP sent to new email' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};


const renderVerifyEmailOtpPage = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    const user = userId ? await User.findById(userId) : null;

    const { newEmail } = req.query;
    if (!newEmail) {
      return res.redirect('/profile/change-email');
    }

    res.render('verify-email-otp', { newEmail, user, errors: {} });
  } catch (error) {
    console.error(error);
    res.redirect('/profile/change-email');
  }
};

const verifyEmailOtp = async (req, res) => {
  try {
    // Validate input
    const { error } = verifyEmailOtpValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      return res.status(400).json({ success: false, errors });
    }

    const { newEmail, otp } = req.body;
    const userId = req.session.user?._id || req.session.passport?.user;

    // Find OTP doc
    const otpDoc = await OtpVerification.findOne({
      userId,
      email: newEmail,
      usageType: EditEmailUsageType,
      isUsed: false,
      expiresAt: { $gt: Date.now() },
    });

    if (!otpDoc) {
      return res.status(400).json({ success: false, errors: { otp: 'OTP not found or expired' } });
    }

    if (otpDoc.otp !== otp.trim()) {
      return res.status(400).json({ success: false, errors: { otp: 'Invalid OTP' } });
    }

    // Mark OTP as used
    otpDoc.isUsed = true;
    await otpDoc.save();

    // Update user email
    await User.findByIdAndUpdate(userId, { email: newEmail });

    // Delete all OTPs for this user (cleanup)
    await OtpVerification.deleteMany({ userId, usageType: EditEmailUsageType });

    return res.json({ success: true, message: 'Email updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
const postResendChangeEmailOtp = async (req, res) => {
  try {
    // 1. Get the logged in user
    const userId = req.session?.user?._id || req.session?.passport;
    if (!userId) {
      return res.redirect("/login"); // not logged in
    }

    // 2. Get new email from form
    const { newEmail } = req.body;
    if (!newEmail) {
      return res.render("verify-email-otp", {
        newEmail: "",
        error: "Please enter an email",
      });
    }

    // 3. Check if another user already has this email
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.render("verify-email-otp", {
        newEmail,
        error: "Email is already used by another account",
      });
    }

    // 4. Create 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. Expire time = 2 minutes
    const expiresAt = Date.now() + 2 * 60 * 1000;

    // 6. Remove old OTP for this user and usage type
    await OtpVerification.deleteMany({ userId, usageType: "EditEmailUsageType" });

    // 7. Save new OTP
    await OtpVerification.create({
      userId,
      usageType: "EditEmailUsageType",
      email: newEmail,
      otp,
      expiresAt,
      isUsed: false,
    });

    // 8. Send OTP to email
    await sendOtpEmail(newEmail, otp);
    console.log("Resent OTP for email change:", otp);

    // 9. Redirect back to verify page
    return res.redirect(
      `/profile/verify-email-otp?newEmail=${encodeURIComponent(newEmail)}`
    );
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.render("verify-email-otp", {
      newEmail: req.body.newEmail || "",
      error: "Something went wrong, please try again",
    });
  }
};
const renderChangePasswordPage =async (req, res) => {
  const userId=req.session?.user._id || req.session?.passport?.user;
  const user=await User.findById(userId);

  res.render("profile-change-password", { errors: {},user });
};

const postChangePassword = async (req, res) => {
  try {
    // 1. Validate inputs using Joi
    const { error } = changePasswordValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      return res.status(400).json({ success: false, errors });
    }

    const { currentPassword, newPassword } = req.body;

    // 2. Get logged-in user
    const userId = req.session?.user?._id || req.session?.passport?.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Compare current password with hashed one in DB
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update password in DB
    user.password = hashedPassword;
    await user.save();

    // 6. Send success response
    return res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports={
    getProfilePage,
    renderEditPersonal,
    updatePersonalInfo,
    renderChangeEmailPage,
    requestEmailOtp,
    renderVerifyEmailOtpPage,
    verifyEmailOtp,
    postResendChangeEmailOtp,
    renderChangePasswordPage,
    postChangePassword
}