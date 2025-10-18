import  Address from '../../models/addressModel.js';
import  User from '../../models/userModel.js';
import {addressValidation } from '../../validator/schema.js';
const getAddressList = async (req, res) => {
  try {
    const userId = req.session?.user?._id || req.session?.passport?.user;
    if (!userId) return res.redirect('/login');

    
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
    const user=await User.findById(userId).lean()
    res.render('addressList', {
      addresses,
      user,
      userId
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server error' });
  }
};


const getAddAddress =  async (req, res) => {

  try {
    const userId=req.session?.user?._id || req.session?.passport?.user;
    let user=null;
    if(userId){
      user=await User.findById(userId).lean();
    }
    res.render("add-address", {
      formData: {},
      error: "",
      user
    });
  } catch (error) {
    console.error("Error loading add address page:", error.message);
    res.status(500).render("error", { message: "Server error" });
  }
};


const postAddAddress = async (req, res) => {
  try {
    
    const { error, value } = addressValidation.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message,
        field: error.details[0].path[0] 
      });
    }

    const userId = req.session?.user._id || req.session?.passport?.user;
    
    if (!userId) {
      return res.status(401).json({ error: "Please log in to add address" });
    }

   
    const newAddress = new Address({
      userId,
      ...value 
    });

    await newAddress.save();

    return res.status(201).json({ 
      success: true, 
      message: "Address added successfully!" 
    });

  } catch (err) {
    console.error("Error in postAddAddress:", err.message);
    return res.status(500).json({ 
      error: "Server error. Please try again." 
    });
  }
};

const getEditAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.session?.user?._id || req.session?.passport?.user;

    if (!userId) {
      return res.redirect("/login");
    }

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).render("error", { message: "Address not found" });
    }

    res.render("edit-address", {
      formData: address,
      error: "",
      user: req.session.user
    });
  } catch (error) {
    console.error("Error loading edit address page:", error.message);
    res.status(500).render("error", { message: "Server error" });
  }
};


const postEditAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.session?.user?._id || req.session?.passport?.user;

    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

  
    const { error } = addressValidation.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ error: error.details.map(d => d.message).join(", ") });
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: addressId, userId },   
      { $set: req.body },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ error: "Address not found" });
    }

    return res.json({ success: true, message: "Address updated successfully!" });
  } catch (err) {
    console.error("Error in postEditAddress:", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};


const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.session?.user?._id || req.session?.passport?.user;

    if (!userId) {
      return res.status(401).json({ error: "Not logged in" });
    }

   
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    const wasDefault = address.isDefault;

    
    await Address.findByIdAndDelete(addressId);

    
    if (wasDefault) {
      const anotherAddress = await Address.findOne({ userId });
      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }

    return res.json({ success: true, message: "Address deleted successfully" });
  } catch (err) {
    console.error("Error deleting address:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
  
    const addressId=req.params.id;
    const userId=req.session?.user?._id || req.session?.passport?.user;
    if(!userId){
      return res.status(401).json({error:"Not logged in "})
    }
    const address =await Address.findOne({_id:addressId,userId});
    if(!address){
      return res.status(404).json({error:"Address not found"})
    }
    const user=await User.findByIdAndUpdate(
      userId,
      {defaultAddressId:addressId},
      {new:true}
    );
    if(req.session.user){
      req.session.user.defaultAddressId=addressId;
      await req.session.save()
    }
    return res.json({success:true,message:"Default address updated "})
  } catch (err) {
    console.error("Error setting default address:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};



const addressController = {
                  getAddressList,
                  getAddAddress,
                  postAddAddress,
                  getEditAddress,
                  postEditAddress,
                  deleteAddress,
                  setDefaultAddress
                  };

export default addressController;
