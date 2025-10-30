import  Product from '../../models/productModel.js';
import  Variant from '../../models/variantModel.js';
import  Brand from '../../models/brandModel.js';
import  Category from '../../models/categoryModel.js';
import Wishlist from '../../models/wishlistModel.js';
import Cart from '../../models/cartModel.js';
import User from '../../models/userModel.js'
import Wallet from '../../models/walletModel.js';
import offerController from '../admin/offerController.js';

const getShopPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    let filter = {
      deletedAt:null,
      isBlocked:false
    };

    
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    
    if (req.query.category) {
      const categoryDoc = await Category.findOne({
        name:{$regex:new RegExp(`^${req.query.category}$`,'i')},
        isDeleted:false
      })
      if (categoryDoc) {
        filter.categoryId = categoryDoc._id;
      }
    }

    
    if (req.query.brand) {
      const brandDoc = await Brand.findOne({
        name:{$regex:new RegExp(`^${req.query.brand}$`,'i')}
      });
      if (brandDoc) {
        filter.brandId = brandDoc._id;
      }
    }

    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.salesPrice = {};
      if(req.query.minPrice){
        filter.salesPrice.$gte= parseInt(req.query.minPrice);
      }
      if(req.query.maxPrice){
        filter.salesPrice.$lte=parseInt(req.query.maxPrice)
      };
    }

    
    let sort = {};
    if (req.query.sort === "priceLowHigh") {
      sort.salesPrice = 1;
    } else if (req.query.sort === "priceHighLow") {
      sort.salesPrice = -1;
    } else if (req.query.sort === "aToZ") {
      sort.name = 1;
    } else if (req.query.sort === "zToA") {
      sort.name = -1;
    } else if (req.query.sort === "newArrivals") {
      sort.createdAt = -1;
    }else{
      sort.createdAt=-1;
    }

    
    const productsRaw = await Product.find(filter)
    .populate('categoryId')
    .populate('brandId')
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .lean();

    
    const products=await Promise.all(
      productsRaw.map(async(product)=>{
        const variant=await Variant.findOne({productId:product._id})
        .sort({createdAt:1})
        .lean();

        if(!variant) return  null;

        const {offerPrice,discount,hasOffer}=offerController.calculateOfferPrice(

          product,
          product.categoryId
        )

        return{
          ...product,
          variantId:variant._id,
          image:variant?.images?.[0] || '/user/assets/imgs/shop/product-placeholder.jpg',
          offerPrice,
          discount,
          hasOffer
        }


      })
    )
   
    const validProducts=products.filter(p=> p!==null);
    const totalProducts=await Product.countDocuments(filter);
    const totalPages=Math.ceil(totalProducts/limit);


    const brands=await Brand.find();
    const categories=await Category.find({isDeleted:false});

    res.render("shop", {
      user: req.session.user || req?.user || null ,
      products:validProducts,
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
    const product = await Product.findById(productId)
                    .populate('categoryId')
                    .lean();
    
    if(!product){
      return res.status(400).send('Product not found')
    }
    
    
    const variants = await Variant.find({ productId: productId });

    const user = req.session?.user  || req?.user;

     
    const brand = await Brand.findById(product.brandId);
    const category=product.categoryId;
    
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


    const {offerPrice,discount,hasOffer}=offerController.calculateOfferPrice(product,category);

    const productWithOffer={
      ...product,
      offerPrice:Math.round(offerPrice),
      discount,
      hasOffer,
      savings:hasOffer ?Math.round(product.salesPrice-offerPrice) :0
    }

    console.log('product with offer:',{
      name:productWithOffer.name,
      salesPrice:productWithOffer.salesPrice,
      offerPrice:productWithOffer.offerPrice,
      discount:productWithOffer.discount,
      hasOffer:productWithOffer.hasOffer
    })


    res.render("productDetail", {
      product:productWithOffer,
      variants,
      user,
      brand,
      category,
      wishlistVariantIds,
      cartItems
    
    });
  } catch (error) {
    console.error('product detail error:',error);
    res.status(500).send("Server Error");
  }
};

const getMyReferrals = async(req, res) => {
  try{
    const userId=req.session?.user?._id|| req.session?.passport?.user;
    
    const user=await User.findById(userId);
    const referrals=await User.find({referredBy:userId});
    const wallet =await Wallet.findOne({userId});
    const totalEarnings =wallet ?wallet.balance:0;
    const totalReferrals =referrals.length;
    res.render('my-referrals',{
      referralCode:user.referralCode,
      referrals,
      totalEarnings,
      totalReferrals,
      BASE_URL:process.env.BASE_URL
    })

  }
 catch(error) {
    console.log('Error loading referrals:', error);
    res.status(500).send('Server error');
  }
};



const userController= {
  getShopPage,
  getProductDetail,
  getMyReferrals

};

export default userController;