const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Import Middleware and Model
const auth = require("../middleware/auth");
const admin = require("../middleware/admin"); // Admin role check
const Doctor = require("../models/Doctor");

// -----------------------------------------------------------
// 1. GET /api/doctors - Retrieve all doctors
// @access Public (Assignment says 'Retrieve all doctors', implying public read is okay)
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. GET /api/doctors/:id - Get details of a specific doctor
// @access Public (Read access is fine without token)
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }
    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    // Handle case where ID format is bad (e.g., shorter than MongoDB ID length)
    if (err.kind === "ObjectId") {
      return res
        .status(404)
        .json({ msg: "Doctor not found (Invalid ID format)" });
    }
    res.status(500).send("Server Error");
  }
});

// -----------------------------------------------------------
// 3. POST /api/doctors - Add a new doctor
// @access Private (Requires Auth and Admin Role)
router.post(
  "/",
  [auth, admin], // Auth first, then check Admin role (Extra Edge)
  [
    check("name", "Doctor name is required").not().isEmpty(), // Killer Feature: Validation
    check("specialization", "Specialization is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, specialization, contactInfo } = req.body;

    try {
      const newDoctor = new Doctor({
        name,
        specialization,
        contactInfo,
      });

      const doctor = await newDoctor.save();
      res.json(doctor);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// 4. PUT /api/doctors/:id - Update doctor details
// @access Private (Requires Auth and Admin Role)
router.put("/:id", [auth, admin], async (req, res) => {
  const { name, specialization, contactInfo } = req.body;

  // Build doctor object
  const doctorFields = {};
  if (name) doctorFields.name = name;
  if (specialization) doctorFields.specialization = specialization;
  if (contactInfo) doctorFields.contactInfo = contactInfo;

  try {
    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });

    doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: doctorFields },
      { new: true } // returns the updated document
    );

    res.json(doctor);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Doctor not found" });
    }
    res.status(500).send("Server Error");
  }
});

// 5. DELETE /api/doctors/:id - Delete a doctor record
// @access Private (Requires Auth and Admin Role)
router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }

    await Doctor.findByIdAndDelete(req.params.id);

    res.json({ msg: "Doctor removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Doctor not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
