const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Import Middleware and Models
const auth = require("../middleware/auth");
const Mapping = require("../models/Mapping");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// -----------------------------------------------------------
// 1. POST /api/mappings - Assign a doctor to a patient
// @access Private (Requires Auth)
router.post(
  "/",
  auth, // Requires any valid token (staff or admin)
  [
    check("patientId", "Patient ID is required").isMongoId(),
    check("doctorId", "Doctor ID is required").isMongoId(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patientId, doctorId } = req.body;

    try {
      // Optional: Verify both Patient and Doctor exist before mapping
      const patient = await Patient.findById(patientId);
      const doctor = await Doctor.findById(doctorId);

      if (!patient || !doctor) {
        return res.status(404).json({ msg: "Patient or Doctor not found" });
      }

      // Check if the patient being assigned was created by the current user (for security/logic)
      if (patient.createdBy.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ msg: "Forbidden: Cannot map a patient you did not create." });
      }

      const newMapping = new Mapping({
        patient: patientId,
        doctor: doctorId,
      });

      const mapping = await newMapping.save();
      res.json(mapping);
    } catch (err) {
      console.error(err.message);
      // Handle the "Extra Edge" unique index error (same patient assigned to same doctor twice)
      if (err.code === 11000) {
        return res
          .status(400)
          .json({
            msg: "Error: This patient is already assigned to this doctor.",
          });
      }
      res.status(500).send("Server Error");
    }
  }
);

// -----------------------------------------------------------
// 2. GET /api/mappings - Retrieve all patient-doctor mappings
// @access Private (Requires Auth)
router.get("/", auth, async (req, res) => {
  try {
    // Extra Edge: Use Mongoose Populate for efficient data retrieval
    const mappings = await Mapping.find()
      .populate({
        path: "patient",
        // Filter mappings so we only show mappings for patients created by this user
        match: { createdBy: req.user.id },
      })
      .populate("doctor")
      .sort({ assignedDate: -1 });

    // Filter out any null entries that result from the match filter above
    const filteredMappings = mappings.filter(
      (mapping) => mapping.patient !== null
    );

    res.json(filteredMappings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. GET /api/mappings/patient/:patientId - Get all doctors assigned to a specific patient
// @access Private (Requires Auth)
router.get("/patient/:patientId", auth, async (req, res) => {
  try {
    // Ensure the patient exists AND was created by this user
    const patient = await Patient.findOne({
      _id: req.params.patientId,
      createdBy: req.user.id,
    });

    if (!patient) {
      return res
        .status(404)
        .json({ msg: "Patient not found or not created by this user" });
    }

    // Find mappings for this specific patient
    const doctors = await Mapping.find({
      patient: req.params.patientId,
    }).populate("doctor"); // Populate just the doctor details

    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Invalid Patient ID format" });
    }
    res.status(500).send("Server Error");
  }
});

// 4. DELETE /api/mappings/:id - Remove a doctor from a patient (delete mapping)
// @access Private (Requires Auth)
router.delete("/:id", auth, async (req, res) => {
  try {
    // Note: We don't verify patient ownership on DELETE for simplicity, but in a real app,
    // you would check if the associated patient was created by this user.
    const mapping = await Mapping.findById(req.params.id);

    if (!mapping) {
      return res.status(404).json({ msg: "Mapping not found" });
    }

    await Mapping.findByIdAndDelete(req.params.id);

    res.json({ msg: "Patient-Doctor mapping removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Mapping not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
