const mongoose = require("mongoose");

const { Schema } = mongoose;
const AdminSchema = Schema({
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
  email: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    unique: true,
  },
  userType: {
    type: String,
    minlength: 3,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 80,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const AdminModel = mongoose.model("Admin", AdminSchema);
module.exports = AdminModel;
