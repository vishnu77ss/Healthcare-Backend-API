const mongoose = require("mongoose");

const MappingSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  assignedDate: {
    type: Date,
    default: Date.now,
  },
});

// Extra Edge: Compound Index to prevent duplicate assignments
// (e.g., same patient assigned to same doctor more than once)
MappingSchema.index({ patient: 1, doctor: 1 }, { unique: true });

module.exports = mongoose.model("Mapping", MappingSchema);
