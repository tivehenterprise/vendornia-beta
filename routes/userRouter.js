const userController = require("../controllers/userController");
const passport = require("passport");
const express = require("express");
const auth = require("../middlewares/auth");
const userRouter = express.Router();

userRouter.post("/auth/signup", userController.signUp);
userRouter.post("/auth/signin", userController.signIn);
userRouter.post("/auth/google/signup", userController.googleSignup);
userRouter.post("/auth/google/signin", userController.googleSignIn);
userRouter.post("/single", auth, userController.getSingleUser);


module.exports = userRouter;
