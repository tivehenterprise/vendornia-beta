const productController = require("../controllers/productController");
const express = require("express");
const multer = require("multer");
const multerStorage = require("../helpers/multerStorage");
const productRouter = express.Router();

// Configure multer for handling file uploads
// const storage = multer.memoryStorage();

const upload = multer({ storage: multerStorage });

productRouter.post(
  "/create",
  (req, res, next) => {
    //   console.log('Request received in /create endpoint');
    upload.array("images")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return next(err);
      }
      // console.log('Multer middleware passed, proceeding to the controller.');
      next();
    });
  },
  productController.create
);

productRouter.post("/single", productController.fetchSingle);
productRouter.post("/delete", productController.deleteSingle);
productRouter.put("/:productId", productController.update);
productRouter.get("/all", productController.fetchAll);


module.exports = productRouter;
