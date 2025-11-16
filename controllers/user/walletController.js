import Wallet from '../../models/walletModel.js';
import User from '../../models/userModel.js';
import razorpayInstance from '../../utils/razorpay.js';
import crypto from 'crypto';

export const getWalletDetails = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    const user = req.session?.user || await User.findById(userId);

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const allTransactions = wallet.transactions.slice().reverse();
    const totalTransactions = allTransactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);

    const paginatedTransactions = allTransactions.slice(skip, skip + limit);

    res.render('wallet', {
      user: user,
      balance: wallet.balance,
      transactions: paginatedTransactions,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      currentPage: page,
      totalPages: totalPages,
      totalTransactions: totalTransactions,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error fetching wallet details:', error);
    res.render('wallet', {
      user: req.user,
      balance: 0,
      transactions: [],
      error: 'Could not load wallet. Please try again',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      currentPage: 1,
      totalPages: 0,
      totalTransactions: 0,
      hasNextPage: false,
      hasPrevPage: false
    });
  }
};

export const createWalletOrder = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.json({ success: false, message: 'Invalid amount' });
    }

    const amountNum = Number(amount);

    if (isNaN(amountNum) || amountNum < 1) {
      return res.json({ success: false, message: "Amount must be at least ₹1" });
    }
    if (amountNum > 100000) {
      return res.json({ success: false, message: 'Maximum amount allowed is ₹1,00,000' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    
    const timestamp = Date.now().toString().slice(-8);
    const receipt = `WLT_${timestamp}`;
    
    

    const options = {
      amount: Math.round(amountNum * 100),
      currency: 'INR',
      receipt: receipt, 
      notes: {
        userId: userId.toString(),
        purpose: 'wallet_recharge'
      }
    };

    console.log("Receipt:", receipt, "Length:", receipt.length);

    const order = await razorpayInstance.orders.create(options);

    return res.json({
      success: true,
      orderId: order.id,
      amount: amountNum,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      user: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phoneNumber
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    
    return res.json({ 
      success: false, 
      message: 'Failed to create payment order'
    });
  }
};

export const verifyWalletPayment = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
      return res.json({ success: false, message: 'Missing payment details' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.json({ success: false, message: 'Payment verification failed' });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0, transactions: [] });
    }

    const amountNum = Number(amount);
    wallet.balance += amountNum;

    wallet.transactions.push({
      type: 'Credit',
      amount: amountNum,
      reason: `Added money via Razorpay (Payment ID: ${razorpay_payment_id})`
    });

    await wallet.save();

    return res.json({
      success: true,
      message: 'Money added successfully',
      newBalance: wallet.balance
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.json({ success: false, message: 'Payment verification failed' });
  }
};

