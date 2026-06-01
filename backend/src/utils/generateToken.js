const jwt = require("jsonwebtoken");

const generateToken = (res, user) => {
  const sameSite = process.env.COOKIE_SAME_SITE || "lax";
  const secureCookie =
    process.env.COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production";

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: secureCookie,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

module.exports = generateToken;
