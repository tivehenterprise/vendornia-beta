const {
  model,
  Schema,
  Types: { ObjectId },
} = require("mongoose");

const vendorSchema = new Schema(
  {
    sellerId: { type: ObjectId, required: true, ref: "User" },
    storeName: String,
    storeDescription: String,
    logo: String,
    banner: {
      type: String,
      default:
        "https://res.cloudinary.com/vendornia/image/upload/v1702427915/defaultImages/defaultBanner_sg5zr6.svg",
    },
    whatsapp: String,
    website: String,
    products: [{ type: ObjectId, ref: "Product" }],
    reviews: Number,
  },
  { timestamps: true }
);
const Vendor = model("Vendor", vendorSchema);

module.exports = Vendor;
