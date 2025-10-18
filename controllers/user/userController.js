import  Product from '../../models/productModel.js';
import  Variant from '../../models/variantModel.js';
import  Brand from '../../models/brandModel.js';
import  Category from '../../models/categoryModel.js';
import Wishlist from '../../models/wishlistModel.js';
import Cart from '../../models/cartModel.js';

const getShopPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    let filter = {};

    
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    
    if (req.query.category) {
      const categoryDoc = await Category.findOne({ name: req.query.category });
      if (categoryDoc) {
        filter.categoryId = categoryDoc._id;
      }
    }

    
    if (req.query.brand) {
      const brandDoc = await Brand.findOne({ name: req.query.brand });
      if (brandDoc) {
        filter.brandId = brandDoc._id;
      }
    }

    
    if (req.query.minPrice && req.query.maxPrice) {
      filter.salesPrice = {
        $gte: parseInt(req.query.minPrice),
        $lte: parseInt(req.query.maxPrice)
      };
    }

    
    let sort = {};
    if (req.query.sort === "priceLowHigh") {
      sort.price = 1;
    } else if (req.query.sort === "priceHighLow") {
      sort.price = -1;
    } else if (req.query.sort === "aToZ") {
      sort.name = 1;
    } else if (req.query.sort === "zToA") {
      sort.name = -1;
    } else if (req.query.sort === "newArrivals") {
      sort.createdAt = -1;
    }

    
    const productsRaw = await Product.find(filter).sort(sort).lean();

    
    let validProducts = [];
    for (let product of productsRaw) {
      const variant = await Variant.findOne({ productId: product._id })
        .sort({ createdAt: 1 })
        .lean();

      if (!variant) continue; 

      product.image = variant?.images?.[0];
      validProducts.push(product);
    }

   
    const totalProducts = validProducts.length;
    console.log(totalProducts);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = validProducts.slice(skip, skip + limit);

    const brands = await Brand.find();
    const categories = await Category.find();

    res.render("shop", {
      user: req.session.user || req?.user || null ,
      products,
      brands,
      categories,
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

const getProductDetail = async (req, res) => {
  try {
    const productId = req.params.productId;

   if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send('Invalid product ID');
    }
    const product = await Product.findById(productId);

    
    
    const variants = await Variant.find({ productId: productId });

    const user = req.session?.user  || req?.user;
    //  console.log(user)
     
    const brand = await Brand.findById(product.brandId);
    const category=await Category.findById(product.categoryId);
    
    let cartItems = [];
if (user) {
  const cart = await Cart.find({ userId: user._id, productId });
  cartItems = cart.map(item => ({
    variantId: item.variantId.toString(),
    quantity: item.quantity
  }));
}

    let wishlistVariantIds=[];
    if(user){
      const wishlistItems=await Wishlist.find({userId:user._id,productId});
      console.log("wishlistItems:",wishlistItems)
      wishlistVariantIds=wishlistItems.map(item=>item.variantId.toString());
      console.log("alreaady  exist variants:",wishlistVariantIds)
    }
    res.render("productDetail", {
      product,
      variants,
      user,
      brand,
      category,
      wishlistVariantIds,
      cartItems
    
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};





const userController= {
  getShopPage,
  getProductDetail

};

export default userController;