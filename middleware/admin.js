// Checks if the authenticated user has the 'admin' role.
module.exports = function (req, res, next) {
  // req.user was set by the auth.js middleware.
  // We check the role from the token payload.
  if (req.user.role !== "admin") {
    // Forbidden error code (403)
    return res.status(403).json({
      msg: "Authorization denied. Only Admin users can perform this action.",
    });
  }
  // User is an admin, proceed to the controller
  next();
};
