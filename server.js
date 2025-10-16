require("dotenv").config(); // MUST be first to load .env variables

const express = require("express");
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit"); // <--- 1. Import Rate Limiter
const app = express();

// -----------------------------------------------------------------
// Extra Edge: API Rate Limiter Setup (Security Feature)
// Limit repeated failed requests to the login endpoint to prevent brute-forcing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per 15 minutes
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
// -----------------------------------------------------------------

// 1. Connect to Database
connectDB();

// 2. Middleware
app.use(express.json()); // Essential to parse JSON bodies from requests

// 3. Root Route
app.get("/", (req, res) => {
  res.send("Healthcare Backend API is running...");
});

// 4. Apply Rate Limiter and Mount All Routes
app.use("/api/auth/login", loginLimiter); // <--- 2. Apply Limiter ONLY to the login route!

app.use("/api/auth", require("./routes/auth"));
app.use("/api/patients", require("./routes/patient"));
app.use("/api/doctors", require("./routes/doctor"));
app.use("/api/mappings", require("./routes/mapping"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
