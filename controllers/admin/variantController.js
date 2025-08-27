const { variantValidation } = require("../../validator/schema");
const Product = require("../../models/productModel");
const Variant = require("../../models/variantModel");
const cloudinary = require('../../config/cloudinary');
const {maxImageSize}=require("../../shared/constant");

const listVariants=async(req,res)=>{
     try {
    const { productId } = req.params;

    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = 5;

    
    const filter = {
      productId: productId,
      deletedAt: null,
      colour: { $regex: search, $options: "i" },
    };

    
    const totalVariants = await Variant.countDocuments(filter);

    
    const variants = await Variant.find(filter)
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalVariants / limit);

   
    return res.render("variant-list", {
      product,
      variants,
      currentPage: page,
      totalPages,
      search,
    });
  } catch (err) {
    console.error("Error loading variants:", err);
    return res.status(500).send("Server error");
  }
}

const loadAddVariant = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("add-variant", {
      formData: {},   
      errors: "",     
      product ,
      maxImageSize        
    });
  } catch (error) {
    console.error("Error loading add variant page:", error.message);
    res.status(500).send("Server error");
  }
};

const postAddVariant = async (req, res) => {
  try {

    console.log("req.body:", req.body);   
    console.log("req.files:", req.files); 

    const productId=req.params.productId;
    console.log("productId:",productId);

    const { error, value } = variantValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach(err => (errors[err.path[0]] = err.message));
      return res.status(400).json({ success: false, errors });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ success: false, message: "Product does not exist" });
    }

    const existingVariant=await Variant.findOne({
        productId:productId,
        colour:value.colour.trim()
    })
    if(existingVariant){
        return res.status(400).json({success:false,message:"colour already exist for this product"});
    }

    
    let imageUrls = req.files.map(file => file.path);

    const newVariant = new Variant({
      productId: productId,
      colour: value.colour,
      stock: value.stock,
      images: imageUrls,
      isVisible: true,
    });

    await newVariant.save();

    res.status(201).json({
      success: true,
      message: "Variant added successfully",
      variant: newVariant,

    });
  } catch (error) {
    console.error("Error adding variant:", error.message);
    res.status(500).json({ success: false, message: "Server error " + error });
  }
};

const getEditVariant = async (req, res) => {
  try {
    const { variantId } = req.params; 
    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res.status(404).send("Variant not found");
    }

   
    const product = await Product.findById(variant.productId);

    res.render("edit-variant", {
      variant, 
      product,  
      errors: "" ,
      maxImageSize
    });
  } catch (error) {
    console.error("Error loading edit variant:", error.message);
    res.status(500).send("Server error");
  }
};

const postEditVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    console.log("productId:", productId, "variantId:", variantId);
    console.log(req.body)

if (!Array.isArray(req.body.existingImages)) {
  req.body.existingImages = req.body.existingImages
    ? [req.body.existingImages]
    : [];
}

    const { error, value } = variantValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach(err => (errors[err.path[0]] = err.message));
      return res.status(400).json({ success: false, errors });
    }

    console.log("bhbnhbh.,",value)

    
    const product = await Product.findById(productId);
    if (!product) return res.status(400).json({ success: false, message: "Product not found" });

    const variant = await Variant.findById(variantId);
    if (!variant) return res.status(400).json({ success: false, message: "Variant not found" });


    const existingVariant = await Variant.findOne({
      productId,
      colour: value.colour.trim(),
      _id: { $ne: variantId }, 
    });
    if (existingVariant) {
      return res.status(400).json({ success: false, message: "Colour already exists for this product" });
    }

    const existingImages = req.body.existingImages || []; 
    const newFiles = req.files || [];                    

    if (existingImages.length + newFiles.length > maxImageSize) {
      return res.status(400).json({ success: false, message: "You can upload max 5 images" });
    }

    
    let newImageUrls = [];
    for (let file of newFiles) {
      newImageUrls.push(file.path); 
    }

    
    const finalImages = [...existingImages, ...newImageUrls];
    if (finalImages.length === 0) {
      return res.status(400).json({ success: false, message: "At least 1 image is required" });
    }

   
    variant.colour = value.colour;
    variant.stock = value.stock;
    variant.images = finalImages;
    variant.isVisible = value.isVisible !== undefined ? value.isVisible : variant.isVisible;

    await variant.save();

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      variant,
    });

  } catch (error) {
    console.error("Error editing variant:", error.message);
    res.status(500).json({ success: false, message: "Server error " + error });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

   
    const variant = await Variant.findByIdAndDelete(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    await Product.findByIdAndUpdate(productId, {
      $pull: { variants: variantId }
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete Variant Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports={
    listVariants,
    loadAddVariant,
    postAddVariant,
    getEditVariant,
    postEditVariant,
    deleteVariant
  };