const {
  model,
  Schema,
  Types: { ObjectId },
} = require("mongoose");

const reviewSchema = new Schema(
  {
    authorEmail: String,
    authorUsername:String,
    comment: String,
    productId: {
      type: ObjectId,
      ref: "Product",
    },
    reaction:String,
  },
  { timestamps: true }
);
const Review = model("Review", reviewSchema);

module.exports = Review;
