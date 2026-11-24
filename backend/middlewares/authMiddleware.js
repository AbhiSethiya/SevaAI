const jwt = require("jsonwebtoken");

const getJwtSecret = () =>
  process.env.JWT_SECRET || process.env.SESSION_SECRET || "hackathon_secret";

exports.isAuthenticated = (req, res, next) => {
  let userObj = req.session?.user || req.user;

  if (!userObj) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      try {
        userObj = jwt.verify(token, getJwtSecret());
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    }
  }

  if (!userObj) return res.status(401).json({ message: "Unauthorized" });

  // Normalize user onto req.user for backward compatibility
  req.user = {
    _id: userObj.id || userObj._id,
    id: userObj.id || userObj._id,
    role: userObj.role,
    username: userObj.username,
    department: userObj.department,
  };

  // Also set req.currentUser for convenience
  req.currentUser = req.user;
  next();
};

// Ensure user has required role(s)
exports.ensureRole =
  (...roles) =>
  (req, res, next) => {
    const role =
      req.session?.user?.role || req.currentUser?.role || req.user?.role;
    if (role && roles.includes(role)) return next();
    return res.status(403).json({ message: "Forbidden" });
  };

exports.isHoD = (req, res, next) => {
  if (!req.currentUser || req.currentUser.role !== "head") {
    return res.status(403).json({ message: "Forbidden: Only HoD allowed" });
  }
  next();
};
