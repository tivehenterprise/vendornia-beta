const express = require("express");
const reviewController = require("../controllers/reviewController");
const reviewRouter = express.Router();

reviewRouter.post("/", reviewController.addReview)
reviewRouter.get("/getAll/:productId", reviewController.getAllProductReviews)


module.exports = reviewRouter