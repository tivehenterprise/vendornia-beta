const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv/config");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRouter");
const vendorRouter = require("./routes/vendorRouter");
const productRouter = require("./routes/productRouter");
const errorHandler = require("./middlewares/errorHandler");
const categoryRouter = require("./routes/categoryRouter");
const reviewRouter = require("./routes/reviewRouter");

//Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

//Routes
app.get("/", (rq, rs) => rs.send("hellO"));
app.use("/user", userRouter);
app.use("/vendor", vendorRouter);
app.use("/product", productRouter);
app.use("/category", categoryRouter);
app.use("/review", reviewRouter);


app.use(errorHandler)


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("App listening...");
});

mongoose
  .connect(process.env.URI)
  .then(() => console.log("Connected to db."))
  .catch((err) => console.log(err));
