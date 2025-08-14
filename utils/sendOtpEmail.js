const transporter = require("../config/nodemailer");
const { EmailVerificationUsageType, ForgotPasswordUsageType } = require('../shared/constant');

const sendOtpEmail = async (to, otp, usageType) => {
  let subject = "";
  let htmlContent = "";


  switch (usageType) {
    case ForgotPasswordUsageType:
      subject = "Change Your Password";
      htmlContent = `
        <h3>Password Change OTP</h3>
        <p>This link  is valid for 5 minutes.</p>
        <p>Click below to change your password directly:</p>
        <a href="${process.env.BASE_URL}/change-password/${to}/${otp}">Change Password</a>
      `;
      break;

    case EmailVerificationUsageType:
      subject = "Verify Your Email";
      htmlContent = `
        <h3>Email Verification</h3>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
      `;
      break;

    default:
      subject = "OTP Verification";
      htmlContent = `
        <h3>OTP Verification</h3>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
      `;
      break;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;
