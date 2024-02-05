const {
  model,
  Schema,
  Types: { ObjectId },
} = require("mongoose");

const productSchema = new Schema(
  {
    sellerId: { type: ObjectId, required: true, ref: "User" },
    images: [String],
    description: String,
    title: String,
    price: String,
    category: String,
    vendorName:String,
    seenBy:Number,
    reviews: [{
      type: ObjectId,
      ref: "Review",
    }],
  },
  { timestamps: true }
);
const Product = model("Product", productSchema);

module.exports = Product;
