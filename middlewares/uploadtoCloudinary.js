const multer = require("multer");
const { storage } = require("../config/cloudinary");

const uploadtoCloudinary = multer({ storage });

module.exports = uploadtoCloudinary;
