const { default: mongoose } = require("mongoose");
const createError = require("../helpers/createError");
const Product = require("../schemas/productSchema");
const User = require("../schemas/userSchema");
const Vendor = require("../schemas/vendorSchema");
const uploadImages = require("../helpers/uploadImages");

const vendorController = {
  create: async (req, res, next) => {
    const { sellerId, storeName, storeDescription, whatsapp, website } =
      req.body;

    if (!sellerId || !storeName || !storeDescription || !whatsapp) {
      return createError(next, "Please provide all vendor data", 400);
    }

    if (whatsapp.substring(1).includes("+")) {
      return createError(next, "Invalid phone number.", 400);
    }

    if (whatsapp[0] !== "+") {
      return createError(next, "Start your number with area code. Ex: +234.", 400);
    }

    try {
      const seller = await User.findById(sellerId);
      if (!seller) {
        return createError(next, "There's no user with this seller id.", 404);
      }

      // Check if 'images' field exists and contains at least one file
      if (!req.files || req.files.length === 0) {
        return createError(next, "Images are required.", 400);
      }

      // Loop through uploaded images and upload to Cloudinary
      const images = await uploadImages(req, next, true);
      const newVendorDetails = {
        sellerId,
        storeName,
        storeDescription,
        logo: images[0],
        whatsapp,
        website,
      };
      
      if (images?.length > 1) {
        newVendorDetails.banner = images[1];
      }
      const newVendor = new Vendor(newVendorDetails);

      await newVendor.save();

      seller.isVendor = true;
      seller.storeId = newVendor._id;

      await seller.save();

      res
        .status(201)
        .json({ success: true, message: "Vendor created", data: newVendor });
    } catch (error) {
      createError(next, "Network error.", 500);
    }
  },
  getSingle: async (req, res, next) => {
    const { sellerId } = req.body;
    if (!sellerId) {
      return createError(next, "Seller ID is required.", 400);
    }

    try {
      const vendorData = await Vendor.findOne({ sellerId });
      if (!vendorData) {
        return createError(next, "Vendor does not exist.", 404);
      }

      const vendorProducts = await Product.find({ sellerId });
      res.status(200).json({
        success: true,
        message: "",
        data: { ...vendorData._doc, products: vendorProducts },
      });
    } catch (error) {
      createError(next, "Network error.", 500);
    }
  },

  update: async (req, res, next) => {
    const updateData = req.body;
    const { vendorId } = updateData;

    try {
      // Find the existing vendor
      const existingVendor = await Vendor.findById(vendorId);

      if (!existingVendor) {
        return createError(next, 404, "Vendor not found");
      }

      delete updateData.vendorId;

      // Update only the provided properties
      Object.assign(existingVendor, updateData);

      // Save the updated vendor
      const updatedVendor = await existingVendor.save();

      res.status(200).json({
        success: true,
        message: "Vendor updated",
        data: updatedVendor,
      });
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      createError(next, 500, "Server error");
    }
  },

  getAllProducts: async (req, res, next) => {
    const sellerId = req.params.sellerId;
    if (!sellerId) {
      return createError(next, "Vendor id is required.", 404);
    }

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return createError(next, "Invalid vendor ID", 400);
    }

    try {
      const sellerExists = await User.findById(sellerId);
      if (!sellerExists) {
        return createError(next, "Vendor does not exist", 404);
      }

      const allVendorProducts = await Product.find({ sellerId });
      res
        .status(200)
        .json({ success: true, message: "", data: allVendorProducts });
    } catch (error) {
      createError(next, "Server error.", 500);
    }
  },
};

module.exports = vendorController;
