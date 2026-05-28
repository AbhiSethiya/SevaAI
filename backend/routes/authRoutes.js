const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} = require("../controllers/authController");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser); // Changed to POST for better security
router.get("/me", getMe);

// Route to programmatically seed the default administrator
router.get("/seed-admin", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const User = require("../models/User");
    
    const adminUsername = "admin";
    const existingAdmin = await User.findOne({ username: adminUsername });
    
    if (existingAdmin) {
      return res.status(200).json({
        message: "Admin already exists",
        username: adminUsername,
        role: existingAdmin.role,
        email: existingAdmin.email
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    
    const adminUser = await User.create({
      username: adminUsername,
      password: hashedPassword,
      role: "admin",
      fullName: "Municipal Administrator",
      email: "admin@sevaai.gov",
      phone: "9999999999",
      isActive: true,
      department: "other"
    });
    
    return res.status(201).json({
      message: "Admin user seeded successfully",
      username: adminUser.username,
      role: adminUser.role,
      email: adminUser.email
    });
  } catch (error) {
    console.error("Error seeding admin:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
