import  multer from "multer";
import  { storage } from "../config/cloudinary.js";

const uploadtoCloudinary = multer({ storage });

export default  uploadtoCloudinary;
