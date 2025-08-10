const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:        { type: String, required: true },
  lastName:         { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  phoneNumber:      { type: String, required: true },
  password:         { type: String, required: true },
  googleId:         { type: String, default: null },
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
