const { default: mongoose } = require("mongoose");
const createError = require("../helpers/createError");
const Product = require("../schemas/productSchema");
const User = require("../schemas/userSchema");
const Vendor = require("../schemas/vendorSchema");
const Category = require("../schemas/categorySchema");
const multer = require("multer");
const uploadImages = require("../helpers/uploadImages");
const Review = require("../schemas/reviewSchema");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: "vendornia",
  api_key: "846873792774756",
  api_secret: "z0OK_0Jwticl07og0Wxa4cYcrlA",
});

const productController = {
  fetchAll: async (req, res, next) => {
    try {
      const allProducts = await Product.find();
      res.status(200).json({ success: true, data: allProducts });
    } catch (error) {
      createError(next, error, 500);
    }
  },
  create: async (req, res, next) => {
    const { sellerId, description, title, price, category } = req.body;
    if (!sellerId || !description || !title || !price || !category) {
      return createError(next, "Please provide all product data.", 404);
    }

    // Check if 'images' field exists and contains at least one file
    if (!req.files || req.files.length === 0) {
      return createError(next, "Images are required.", 400);
    }

    try {
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        return createError(next, "Invalid vendor ID.", 400);
      }

      const seller = await User.findById(sellerId);
      if (!seller) {
        return createError(next, "No vendor with that ID.", 404);
      }

      // Check if the provided category tag exists in the Category document
      const categoryDocument = await Category.findOne({});
      if (categoryDocument) {
        const { tags } = categoryDocument;
        if (!tags.includes(category)) {
          tags.push(category); // Add the new category tag
          await categoryDocument.save();
        }
      } else {
        const newCategory = new Category({ tags: [category] });
        await newCategory.save();
      }

      //Look for a vendor whoose sellerId matches the userId of the incoming vendor request
      const productVendor = await Vendor.findOne({ sellerId });
      if (!productVendor) {
        return createError(next, "Vendor does not exist.", 404);
      }

      // Loop through uploaded images and upload to Cloudinary
      const images = await uploadImages(req, next, false);

      const newProduct = new Product({
        sellerId,
        images,
        description,
        title,
        price,
        category,
        vendorName: productVendor.storeName,
      });

      await newProduct.save();

      await Vendor.updateOne(
        { _id: productVendor._id },
        { $push: { products: newProduct } }
      );

      res
        .status(201)
        .json({ success: true, message: "Product created.", data: newProduct });
    } catch (error) {
      createError(next, error, 500);
    }
  },

  fetchSingle: async (req, res, next) => {
    const { productId } = req.body;

    if (!productId) {
      return createError(next, "Product ID is required.", 404);
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return createError(next, "Invalid product ID.", 400);
    }

    try {
      const productData = await Product.findById(productId);

      if (!productData) {
        return createError(next, "No product found with that ID.", 404);
      }

      const productReviews = await Review.find({ productId });

      res.status(200).json({
        success: true,
        message: "",
        data: { ...productData._doc, reviews: productReviews },
      });
    } catch (error) {
      createError(next, "Server error.", 500);
    }
  },

  deleteSingle: async (req, res, next) => {
    const { productId } = req.body;

    try {
      const productData = await Product.findByIdAndDelete(productId);

      if (!productData) {
        createError(next, "No product found with that ID.", 404);
      }

      if (productData) {
        res.status(200).json({ success: true, message: "Product deleted." });
      }
    } catch (error) {
      createError(next, "Server error.", 500);
    }
  },

  update: async (req, res, next) => {
    const productId = req.params.productId;
    const productDetails = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return createError(next, "Invalid product ID.", 400);
    }

    try {
      const productData = await Product.findOneAndUpdate(
        { _id: productId },
        productDetails
      );

      if (!productData) {
        createError(next, "No product found with that ID.", 404);
      }

      if (productData) {
        res.status(200).json({ success: true, message: "Product updated." });
      }
    } catch (error) {
      createError(next, "Server error.", 500);
    }
  },
};

module.exports = productController;
