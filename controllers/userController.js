const createError = require("../helpers/createError");
const { createAccessToken, createRefreshToken } = require("../helpers/tokens");
const User = require("../schemas/userSchema");
const { hash, compare } = require("bcryptjs");

const removePassword = (user) => {
  // Exclude the password field from the response
  const userWithoutPassword = { ...user._doc };
  delete userWithoutPassword.password;
  return userWithoutPassword;
};

const userController = {
  signUp: async (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return createError(next, "Please provide all credentials.", 400);
    }

    try {
      const userExists = await User.findOne({ username });
      if (userExists) {
        return createError(next, "Username is taken.", 400);
      }

      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return createError(
          next,
          "That email already exists. Please sign in instead.",
          400
        );
      }

      const hashedPassword = await hash(password, 7);
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();

      const tokenData = { userId: newUser._id, email: newUser.email };
      const accessToken = createAccessToken(tokenData);
      const refreshToken = createRefreshToken(tokenData);

      const user = removePassword(newUser);

      return res.status(201).json({
        success: true,
        message: "Registered successfully.",
        data: { ...user, accessToken, refreshToken },
      });
    } catch (error) {
      return createError(next, error.message, 500);
    }
  },

  signIn: async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return createError(next, "Incomplete credentials.", 400);
    }

    try {
      const userExists = await User.findOne({ email });
      if (!userExists) {
        return createError(
          next,
          "Please create an account before signing in.",
          404
        );
      }

      const passwordMatches = await compare(password, userExists?.password);
      if (!passwordMatches) {
        return createError(next, "Incorrect Password.", 401);
      }

      const tokenData = { userId: userExists._id, email: userExists.email };
      const accessToken = createAccessToken(tokenData);
      const refreshToken = createRefreshToken(tokenData);

      const user = removePassword(userExists);

      return res.status(201).json({
        success: true,
        message: "Login successful.",
        data: { ...user, accessToken, refreshToken },
      });
    } catch (error) {
      return createError(next, error.message);
    }
  },

  googleSignup: async (req, res, next) => {
    const { username, email } = req.body;
    if (!username || !email) {
      return createError(next, "Please provide all credentials.", 409);
    }

    try {
      const userExists = await User.findOne({ username });
      if (userExists) {
        return createError(
          next,
          "Sorry, your google username is taken. Please sign in manually.",
          400
        );
      }

      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return createError(
          next,
          "That email already exists. Please sign in instead.",
          400
        );
      }

      const newUser = new User({ username, email });
      await newUser.save();

      const tokenData = { userId: newUser._id, email: newUser.email };
      const accessToken = createAccessToken(tokenData);
      const refreshToken = createRefreshToken(tokenData);

      return res.status(201).json({
        success: true,
        message: "Registered successfully.",
        data: { ...newUser, accessToken, refreshToken },
      });
    } catch (error) {
      return createError(next, error.message);
    }
  },

  googleSignIn: async (req, res, next) => {
    const { username, email } = req.body;
    if (!email) {
      return createError(next, "Incomplete credentials.", 400);
    }

    const addTokens = (userObj) => {
      const tokenData = { userId: userObj._id, email: userObj.email };
      const accessToken = createAccessToken(tokenData);
      const refreshToken = createRefreshToken(tokenData);

      return res.status(201).json({
        success: true,
        message: "Login successful.",
        data: { ...userObj, accessToken, refreshToken },
      });
    };

    try {
      const userExists = await User.findOne({ email });
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "Please create an account before signing in.",
        });
      }

      addTokens(userExists);
    } catch (error) {
      return createError(next, error.message, 500);
    }
  },
  getSingleUser: async (req, res, next) => {
    try {
      const userExists = await User.findById(req.user);
      if (!userExists) {
        return createError(next, "User does not exist.", 404);
      }

      res.status(200).json({ success: true, message: "", data: userExists });
    } catch (error) {
      createError(next, "Network error.", 500);
    }
  },
};

module.exports = userController;
