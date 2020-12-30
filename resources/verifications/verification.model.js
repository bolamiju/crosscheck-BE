const mongoose = require("mongoose");

const { Schema } = mongoose;
const verificationSchema = Schema({
  firstName: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  lastName: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  middleName: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },

  dateOfBirth: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  course: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  amount: {
    type: Number,
    required: true,
    minlength: 4,
    maxlength: 80
  },
  studentId: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  qualification: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  classification: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  admissionYear: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  graduationYear: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  enrollmentStatus: {
    type: String,
    minlength: 2,
    maxlength: 50
  },
  institution: {
    type: String,
    minlength: 2,
    maxlength: 80
  },
  status: {
    type: String,
    minlength: 2,
    maxlength: 80,
    default: "pending"
  },
  date: {
    type: String,
    minlength: 2,
    maxlength: 20
  },
  certImage: { type: String },
  proof: { type: String }
});

const verificationModel = mongoose.model("Verification", verificationSchema);
module.exports = verificationModel;
