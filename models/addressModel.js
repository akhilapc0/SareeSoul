import  mongoose from 'mongoose';
const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },   
  phone: { type: String, required: true },
  house: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  
 
}, { timestamps: true });

export default mongoose.model('Address', addressSchema);