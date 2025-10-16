const jwt = require("jsonwebtoken");

// This middleware checks for a valid JWT token in the Authorization header.
module.exports = function (req, res, next) {
  // Get token from header (format: 'Bearer <token>')
  const token = req.header("Authorization");

  // Check if token exists
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Extract the token part (remove 'Bearer ')
  const tokenParts = token.split(" ");
  if (tokenParts[0] !== "Bearer" || tokenParts.length !== 2) {
    return res
      .status(401)
      .json({ msg: "Token format is invalid (Expected: Bearer <token>)" });
  }
  const tokenValue = tokenParts[1];

  // Verify token
  try {
    // Decode the token using the secret key from .env
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // Attach user info (id, role) from the token payload to the request object
    // This makes the user ID available in all protected controllers
    req.user = decoded.user;
    next(); // Allow the request to proceed to the next middleware or controller
  } catch (err) {
    // Token is not valid (expired, corrupted, or wrong secret)
    res.status(401).json({ msg: "Token is not valid" });
  }
};
