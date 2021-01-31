const mongoose = require("mongoose");

const { Schema } = mongoose;
const RateSchema = Schema({
  currency: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  current_rate: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },

});

const RateModel = mongoose.model("Rate", RateSchema);
module.exports = RateModel;
