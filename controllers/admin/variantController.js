import  { variantValidation } from "../../validator/schema.js";
import  Product from "../../models/productModel.js";
import Variant  from "../../models/variantModel.js";
import  {cloudinary,storage}  from '../../config/cloudinary.js';

import  {maxImageSize} from '../../shared/constant.js';







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

     console.log("req.body:",JSON.stringify(req.body));   
    console.log("req.files:", req.files); 

    const productId=req.params.productId;
   console.log("productId type:", typeof productId, "value:", productId);   
    console.log("req.files type:", Array.isArray(req.files), "value:", req.files); 

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
    res.status(500).json({ success: false, message: "Server error " + error.message });
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
    console.log(`productId: ${productId}  variantId: ${variantId}`);
    
    if (!Array.isArray(req.body.existingImages)) {
      req.body.existingImages = req.body.existingImages
      ? [req.body.existingImages]
      : [];
    }
    console.log("hihihi")

    const { error, value } = variantValidation.validate(req.body, { abortEarly: false });
    
    if (error) {
     
      
      console.log(error)
      const errors = {};
      error.details.forEach(err => (errors[err.path[0]] = err.message));
      return res.status(400).json({ success: false, errors });
    }

   

    
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
      return res.status(400).json({ success: false, message: `You can upload max ${maxImageSize}  images` });
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
   console.log("value.colour:", value.colour, typeof value.colour);
console.log("value.stock:", value.stock, typeof value.stock);

    await variant.save();
      
    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      variant,
    });

  } catch (error) {
    console.error("Error editing variant:", error.message);
    res.status(500).json({ success: false, message: "Server error " + error.message });
  }
};

const toggleBlock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { isBlocked } = req.body;

    const variant = await Variant.findById(variantId);
    if (!variant) return res.status(400).json({ success: false, message: "Variant not found" });

    variant.isBlocked = isBlocked;
    await variant.save();

    res.status(200).json({ success: true, message: `Variant ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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


const variantController={
    listVariants,
    loadAddVariant,
    postAddVariant,
    getEditVariant,
    postEditVariant,
    toggleBlock,
    deleteVariant
  };

  export default variantController;
