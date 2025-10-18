import express from "express";
import { addToWishlist, getWishlist,renderWishlistPage,removeFromWishlist } from "../../controllers/user/wishlistController.js";
import { isLoggedIn, checkBlock } from '../../middlewares/userAuth.js';


const router = express.Router();

router.post("/add", isLoggedIn,checkBlock,addToWishlist);
router.get("/wishlist/data",isLoggedIn,checkBlock,getWishlist);
router.get("/wishlist", isLoggedIn, checkBlock, renderWishlistPage);
router.delete("/remove/:id", isLoggedIn, checkBlock, removeFromWishlist);
export default router;

