const mongoose = require("mongoose");

const { Schema } = mongoose;
const verificationSchema = Schema({
  whatToRequest: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  firstName: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  lastName: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  amount: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 50,
  },

  school: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  degreeLevel: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  degreeTitle: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  date: Date,
  certImage: { type: String },
});

const verificationModel = mongoose.model("Verification", verificationSchema);
module.exports = verificationModel;
