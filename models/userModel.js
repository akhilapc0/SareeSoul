const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:        { type: String, required: false },
  lastName:         { type: String, required: false },
  email:            { type: String, required: true, unique: true },
  phoneNumber:      { type: String, required: false,sparse:true,default:null,unique:false },
  password:         { type: String, required: false },
  googleId:         { type: String, default: null,unique:true },
  isBlocked:        { type: Boolean, default: false },
  isVerified:       { type: Boolean, default: false },
  isAdmin:          { type: Boolean, default: false },
  defaultAddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', default: null },
  image:            { type: [String], default: [] },
  createdAt:        { type: Date, default: Date.now },
  updatedAt:        { type: Date, default: null },
  deletedAt:        { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);
