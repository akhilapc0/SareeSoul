import  mongoose from 'mongoose';

const otpVerificationSchema=new mongoose.Schema({
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email:      { type: String, required: true },
  otp:        { type: String, required: true },
  usageType:  { type: String, required: true }, 
  expiresAt:  { type: Date, required: true },
  isUsed:     { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: null }
})

export default  mongoose.model('OtpVerification', otpVerificationSchema);