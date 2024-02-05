const createError = require("../helpers/createError");
const validateId = require("../helpers/validateId");
const Product = require("../schemas/productSchema");
const Review = require("../schemas/reviewSchema");
const User = require("../schemas/userSchema");

const validateReaction = (reaction) => {
  const validReactions = ["love", "like", "dislike", "warn"];
  return validReactions.includes(reaction);
};

const reviewController = {
  addReview: async (req, res, next) => {
    const { authorEmail, comment, productId, reaction, authorUsername } =
      req.body;

      console.log(req.body)
    if (
      !authorEmail ||
      !comment ||
      !productId ||
      !reaction ||
      !authorUsername
    ) {
      return createError(next, "Incomplete review details.", 400);
    }

    if (!validateId(productId)) {
      return createError(next, "Invalid product ID.", 400);
    }

    if (!validateReaction(reaction)) {
      return createError(
        next,
        "Invalid reaction. Pick between: Love, Like, Dislike, Warn.",
        400
      );
    }

    try {
      const verifyEmail = await User.find({ email: authorEmail });
      if (!verifyEmail) {
        return createError(next, "No user exists with that email.", 404);
      }

      const verifyUsername = await User.find({ username: authorUsername });
      if (!verifyUsername) {
        return createError(next, "No user exists with that username.", 404);
      }

      const targetProduct = await Product.findById(productId);
      if (!targetProduct) {
        return createError(next, "That product doesn't exist.", 404);
      }

      const newReview = new Review({ authorEmail, authorUsername, comment, productId, reaction });
      await newReview.save();

      await targetProduct.updateOne({ $push: { reviews: newReview._id } });
      res.status(201).json({ success: true, message: "" });
    } catch (error) {
      createError(next, error.message, 500);
    }
  },

  getAllProductReviews: async (req, res, next) => {
    const { productId } = req.params;
    if (productId) {
      return createError(next, "Product ID is required.", 400);
    }

    if (!validateId(productId)) {
      return createError(next, "Invalid product ID.", 400);
    }

    try {
      // const targetProduct = await Product.findById(productId);
      // if (!targetProduct) {
      //   return createError(next, "Product does not exist.", 400);
      // }

      const productReviews = await Review.find({ productId });
      if (!productReviews || productReviews?.length == 0) {
        return createError(
          next,
          "No review(s) exist with that product ID.",
          404
        );
      }

      res.status(200).json({ success: true, data: productReviews });
    } catch (error) {
      createError(next, error.message, 500);
    }
  },
};

module.exports = reviewController;
