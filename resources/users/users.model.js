const mongoose = require("mongoose");

const { Schema } = mongoose;
const UserSchema = Schema({
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
  organizationName: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 50,
  },
  country: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  phone: {
    type: String,
    required: true,
    minlength: 7,
    maxlength: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 80,
  },
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
