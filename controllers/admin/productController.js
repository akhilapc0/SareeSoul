const Product=require('../../models/productModel');
const Category = require("../../models/categoryModel");
const Brand = require("../../models/brandModel");
const {productValidation}=require('../../validator/schema');

const loadProductList = async (req, res) => {
  try {
    
    const search = req.query.search || "";

    
    const page = Number(req.query.page) || 1;

    const limit = 5;

   
    const filter = {

         deletedAt:null,
      name: { $regex: search, $options: "i" }
    };

    
    const totalProducts = await Product.countDocuments(filter);

    
    const products = await Product.find(filter)
      .populate("categoryId")
      .populate("brandId")
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * limit)
      .limit(limit);

   
    const totalPages = Math.ceil(totalProducts / limit);

    
    return res.render("product-list", {
      products,
      currentPage: page,
      totalPages,
      search
    });

  } catch (error) {
    console.error("Error loading product list:", error);
    return res.status(500).send("Server error");
  }
};


const loadAddProduct = async (req, res) => {
  try {
    const categories = await Category.find({});
    const brands = await Brand.find({});
    

    res.render("add-product", {
      formData: {},     
      errors: "",         
      categories,         
      brands              
    });
  } catch (error) {
    console.error("Error loading add product page:", error.message);
    res.status(500).send("Server error");
  }
};

const postAddProduct = async (req, res) => {
  try {
    
    const { error, value } = productValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = {};
      error.details.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      return res.status(400).json({ success: false, errors });
    }

   
    const category = await Category.findById(value.categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category does not exist"
      });
    }

    
    const brand = await Brand.findById(value.brandId);
    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "Brand does not exist"
      });
    }

    
    const existingProduct = await Product.findOne({
      name: value.name,
      categoryId: value.categoryId,
      brandId: value.brandId
    });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with the same name already exists in this category and brand"
      });
    }

    
    if (value.salesPrice > value.actualPrice) {
      return res.status(400).json({
        success: false,
        message: "Sales price cannot be greater than actual price"
      });
    }

    

    
    const newProduct = new Product({
      name: value.name,
      description: value.description,
      actualPrice: value.actualPrice,
      salesPrice: value.salesPrice,
      categoryId: value.categoryId,
      brandId: value.brandId,
      
      
    });

    await newProduct.save();

   
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

const getEditProduct = async (req, res) => {
  try {
    const productId = req.params.id; 
   
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

   
    
    const categories = await Category.find({});
    const brands = await Brand.find({});

    
    res.render("edit-product", {
      product,   
      categories,  
      brands       
    });

  } catch (error) {
    console.error("Error loading edit product page:", error.message);
    res.status(500).send("Server error");
  }
};

const postEditProduct = async (req, res) => {
  try {
    const productId = req.params.id; 

    
    const { error, value } = productValidation.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map(err => err.message)
      });
    }

    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    
    const category = await Category.findById(value.categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category does not exist"
      });
    }

    
    const brand = await Brand.findById(value.brandId);
    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "Brand does not exist"
      });
    }

    
    const existingProduct = await Product.findOne({
      name: value.name,
      categoryId: value.categoryId,
      brandId: value.brandId,
      _id: { $ne: productId } 
    });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Another product with the same name already exists in this category and brand"
      });
    }

    
    if (value.salesPrice > value.actualPrice) {
      return res.status(400).json({
        success: false,
        message: "Sales price cannot be greater than actual price"
      });
    }

    
    product.name = value.name;
    product.description = value.description;
    product.actualPrice = value.actualPrice;
    product.salesPrice = value.salesPrice;
    product.categoryId = value.categoryId;
    product.brandId = value.brandId;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });

  } catch (error) {
    console.error("Error editing product:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id; 

   
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

   
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

   
    
    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting product:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error, something went wrong"
    });
  }
};





module.exports={
    loadProductList,
    loadAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    deleteProduct,
   
    
}