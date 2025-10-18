import  mongoose from 'mongoose';
import  Counter from './counterModel.js';


const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    itemStatus: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'ReturnRequested', 'Returned'],
        default: 'Pending'
    },
    returnReason: String,   
    rejectReason: String,
    cancelReason:String    
});


const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: {
        fullName: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    items: [orderItemSchema],
    paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'COD' },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'ReturnRequested', 'Partial', 'Partially Shipped'],
    default: 'Pending'
},
    createdAt: { type: Date, default: Date.now }
});


orderSchema.pre('save', async function (next) {
    const doc = this;
    if (!doc.isNew) return next();
    try {
        const counter = await Counter.findOneAndUpdate(
            { id: "order" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        doc.orderId = `ORD-${counter.seq}`;
        next();
    } catch (err) {
        console.log("Error in pre save:", err);
        next(err);
    }
});

export default mongoose.model('Order', orderSchema);
