const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Crucial for unique user registration
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Extra Edge: Role for Authorization (Admin/Basic)
  role: {
    type: String,
    enum: ["admin", "basic"],
    default: "basic",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
