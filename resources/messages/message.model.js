const mongoose = require("mongoose");

const { Schema } = mongoose;
const MessageSchema = Schema({
  id: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  subject: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  message: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },

  status: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 80,
    default: "unread",
  },
});

const MessageModel = mongoose.model("Message", MessageSchema);
module.exports = MessageModel;
