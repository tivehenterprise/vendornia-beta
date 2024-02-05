const vendorController = require("../controllers/vendorController");
const express = require("express");
const auth = require("../middlewares/auth");
const multerStorage = require("../helpers/multerStorage");
const multer = require("multer");
const vendorRouter = express.Router();

const upload = multer({ storage: multerStorage });

vendorRouter.post(
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
  vendorController.create
);
vendorRouter.post("/single", vendorController.getSingle);
vendorRouter.get("/products/:sellerId", vendorController.getAllProducts);
vendorRouter.put("/", vendorController.update);
// vendorRouter.get("/filters", vendorController.getFilters)

module.exports = vendorRouter;
