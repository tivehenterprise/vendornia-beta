const { verify } = require("jsonwebtoken");
const createError = require("../helpers/createError");
const auth = (req, res, next) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return createError(next, "Unauthorized.", 401);
  }

  verify(accessToken, process.env.ATS, (err, decoded) => {
    if (err) {
      return createError(next, "Invalid token.", 403);
    }
    req.user = decoded.userId
    next();
  });
};

module.exports = auth;
