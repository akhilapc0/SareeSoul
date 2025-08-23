const Product=require('../../models/productModel');
const Category = require("../../models/categoryModel");
const Brand = require("../../models/brandModel");
const {productValidation}=require('../../validator/schema');

const loadProductList = async (req, res) => {
  try {
    // 1. Search keyword from query (default empty string)
    const search = req.query.search || "";

    // 2. Current page (default 1)
    const page = Number(req.query.page) || 1;

    // 3. Limit per page
    const limit = 5;

    // 4. Filter condition for search
    const filter = {

         deletedAt:null,
      name: { $regex: search, $options: "i" }
    };

    // 5. Count total products
    const totalProducts = await Product.countDocuments(filter);

    // 6. Fetch products with pagination (latest first)
    const products = await Product.find(filter)
      .populate("categoryId")
      .populate("brandId")
      .sort({ createdAt: -1 }) // always latest first
      .skip((page - 1) * limit)
      .limit(limit);

    // 7. Total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // 8. Render page
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
      categories,  // dropdown options
      brands       // dropdown options
    });

  } catch (error) {
    console.error("Error loading edit product page:", error.message);
    res.status(500).send("Server error");
  }
};

// Edit Product
const postEditProduct = async (req, res) => {
  try {
    const productId = req.params.id; // product id comes from URL

    // Validate input with Joi
    const { error, value } = productValidation.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map(err => err.message)
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check category exists
    const category = await Category.findById(value.categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category does not exist"
      });
    }

    // Check brand exists
    const brand = await Brand.findById(value.brandId);
    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "Brand does not exist"
      });
    }

    // Check duplicate product (ignore current one)
    const existingProduct = await Product.findOne({
      name: value.name,
      categoryId: value.categoryId,
      brandId: value.brandId,
      _id: { $ne: productId } // exclude current product
    });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Another product with the same name already exists in this category and brand"
      });
    }

    // Check sales price condition
    if (value.salesPrice > value.actualPrice) {
      return res.status(400).json({
        success: false,
        message: "Sales price cannot be greater than actual price"
      });
    }

    // Update product
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
    const productId = req.params.id; // take product id from URL

    // 1. Check if productId is provided
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // 2. Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // 3. Delete the product
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

const getProducts = async (req, res) => {
  try {
    // ---------------------------
    // 1. Pagination setup
    // ---------------------------
    const page = parseInt(req.query.page) || 1; // current page
    const limit = 8; // products per page
    const skip = (page - 1) * limit;

    // ---------------------------
    // 2. Build filter object
    // ---------------------------
    let filter = { isBlocked: false, isListed: true };

    // search by product name
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    // category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // brand filter
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }

    // price range filter
    if (req.query.minPrice && req.query.maxPrice) {
      filter.price = {
        $gte: parseInt(req.query.minPrice),
        $lte: parseInt(req.query.maxPrice)
      };
    }

    // ---------------------------
    // 3. Sorting setup
    // ---------------------------
    let sort = {};
    if (req.query.sort === "priceLowHigh") {
      sort.price = 1; // ascending
    } else if (req.query.sort === "priceHighLow") {
      sort.price = -1; // descending
    } else if (req.query.sort === "aToZ") {
      sort.name = 1;
    } else if (req.query.sort === "zToA") {
      sort.name = -1;
    } else if (req.query.sort === "newArrivals") {
      sort.createdAt = -1; // newest first
    }

    // ---------------------------
    // 4. Fetch products
    // ---------------------------
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // ---------------------------
    // 5. Attach first variant image
    // ---------------------------
    for (let product of products) {
      const variant = await Variant.findOne({ productId: product._id })
        .sort({ createdAt: 1 }) // pick first variant
        .lean();

      product.image = variant?.images?.[0] || "/default.jpg"; 
      // fallback image if no variant image
    }

    // ---------------------------
    // 6. Count total for pagination
    // ---------------------------
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // ---------------------------
    // 7. Render to EJS
    // ---------------------------
    res.render("user/products", {
      products,
      currentPage: page,
      totalPages,
      search: req.query.search || "",
      sortOption: req.query.sort || "",
      category: req.query.category || "",
      brand: req.query.brand || "",
      minPrice: req.query.minPrice || "",
      maxPrice: req.query.maxPrice || ""
    });

  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Server error");
  }
};

module.exports={
    loadProductList,
    loadAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    deleteProduct,
    getProducts
}