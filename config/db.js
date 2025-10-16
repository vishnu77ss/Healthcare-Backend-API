const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Mongoose 6+ automatically handles deprecated options
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1); // Exit process with failure code
  }
};

module.exports = connectDB;
