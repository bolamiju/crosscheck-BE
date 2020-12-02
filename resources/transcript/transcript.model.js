const mongoose = require("mongoose");

const { Schema } = mongoose;
const TranscriptSchema = Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  amount: {
    type: Number,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  matricNo: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  course: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },

  graduationYear: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  destination: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  address: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 80,
  },
  zipCode: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  destinationNumber: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  city: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  institution: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 80,
  },
  status: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 80,
    default: "pending",
  },
  date: {
    type: String,
    minlength: 2,
    maxlength: 20,
  },
});

const TranscriptModel = mongoose.model("Transcript", TranscriptSchema);
module.exports = TranscriptModel;
