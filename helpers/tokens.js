const { sign } = require("jsonwebtoken");
const createAccessToken = (user) => {
  return accessToken = sign(user, process.env.ATS, { expiresIn: "5d" });
};

const createRefreshToken = (user) => {
  return refreshToken = sign(user, process.env.RTS, { expiresIn: "1w" });
};

module.exports = { createAccessToken, createRefreshToken };
