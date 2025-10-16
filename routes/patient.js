const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// Import Middleware and Model
const auth = require("../middleware/auth");
const Patient = require("../models/Patient");

// -----------------------------------------------------------
// 1. POST /api/patients - Add a new patient
// @access Private (Requires Auth)
router.post(
  "/",
  auth, // Requires any valid token
  [
    check("name", "Patient name is required").not().isEmpty(), // Killer Feature: Validation
    check("age", "Age must be a number between 1 and 120").isInt({
      min: 1,
      max: 120,
    }),
    check("gender", "Gender is required").isIn(["Male", "Female", "Other"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, age, gender, contactInfo } = req.body;

    try {
      // Crucial: Assign the patient to the currently authenticated user (req.user.id)
      const newPatient = new Patient({
        name,
        age,
        gender,
        contactInfo,
        createdBy: req.user.id, // Fulfills "created by authenticated user"
      });

      const patient = await newPatient.save();
      res.json(patient);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// -----------------------------------------------------------
// 2. GET /api/patients - Retrieve all patients created by the authenticated user
// @access Private (Requires Auth)
router.get("/", auth, async (req, res) => {
  try {
    // Fulfills the assignment requirement to filter by the creator's ID
    const patients = await Patient.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(patients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. GET /api/patients/:id - Get details of a specific patient
// @access Private (Requires Auth)
router.get("/:id", auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!patient) {
      // Added secondary check: ensure the patient exists AND was created by this user
      return res
        .status(404)
        .json({ msg: "Patient not found or not created by this user" });
    }
    res.json(patient);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Patient not found" });
    }
    res.status(500).send("Server Error");
  }
});

// 4. PUT /api/patients/:id - Update patient details
// @access Private (Requires Auth)
router.put("/:id", auth, async (req, res) => {
  const { name, age, gender, contactInfo } = req.body;

  // Build patient object to update
  const patientFields = {};
  if (name) patientFields.name = name;
  if (age) patientFields.age = age;
  if (gender) patientFields.gender = gender;
  if (contactInfo) patientFields.contactInfo = contactInfo;

  try {
    let patient = await Patient.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!patient)
      return res
        .status(404)
        .json({ msg: "Patient not found or not created by this user" });

    // Perform the update
    patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: patientFields },
      { new: true }
    );

    res.json(patient);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Patient not found" });
    }
    res.status(500).send("Server Error");
  }
});

// 5. DELETE /api/patients/:id - Delete a patient record
// @access Private (Requires Auth)
router.delete("/:id", auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!patient) {
      return res
        .status(404)
        .json({ msg: "Patient not found or not created by this user" });
    }

    await Patient.findByIdAndDelete(req.params.id);

    res.json({ msg: "Patient removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Patient not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
