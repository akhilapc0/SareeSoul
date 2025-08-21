const { variantValidation } = require("../../validator/schema");
const Product = require("../../models/productModel");
const Variant = require("../../models/variantModel");
const cloudinary = require('../../config/cloudinary');

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
      formData: {},   // empty for now, useful if validation fails later
      errors: "",     // same idea as your product add
      product         // pass product to EJS
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
    console.log("productId:",productId)
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

    // Extract Cloudinary URLs
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

module.exports={
    listVariants,
    loadAddVariant,
    postAddVariant
  };