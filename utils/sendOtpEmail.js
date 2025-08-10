const transporter = require("../config/nodemailer");
const {EmailVerificationUsageType,ForgotPasswordUsageType}=require('../shared/constant');

const sendOtpEmail = async (to, otp, usageType) => {
  let subject = "";
  let heading = "";

  switch (usageType) {
    case ForgotPasswordUsageType:
      subject = "Reset Your Password";
      heading = "Password Reset OTP";
      break;

    case EmailVerificationUsageType:
      subject = "Verify Your Email";
      heading = "Email Verification OTP";
      break;

    default:
      subject = "OTP Verification";
      heading = "OTP Verification";
      break;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: `
      <h3>${heading}</h3>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;
