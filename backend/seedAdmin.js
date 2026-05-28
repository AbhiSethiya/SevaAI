// backend/seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Error: MONGO_URI environment variable is missing!");
  process.exit(1);
}

async function seedAdmin() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully!");

    const adminUsername = "admin";
    const existingAdmin = await User.findOne({ username: adminUsername });

    if (existingAdmin) {
      console.log(`Admin user with username '${adminUsername}' already exists.`);
      console.log(`Role: ${existingAdmin.role}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log("Seeding skipped.");
      process.exit(0);
    }

    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    console.log("Creating admin user...");
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

    console.log("Admin user seeded successfully!");
    console.log("=========================================");
    console.log(`Username: ${adminUser.username}`);
    console.log(`Password: admin123`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Email: ${adminUser.email}`);
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

seedAdmin();
