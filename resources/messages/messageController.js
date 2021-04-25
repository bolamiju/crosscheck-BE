const Message = require("./message.model");

const sendMessage = async (req, res) => {
  try {
    let { id, message, subject,date } = req.body;

    const doc = new Message({
      id,
      message,
      subject,
      dateTime
    });

    await doc.save();

    return res.status(201).json({
      message: "message sent successfuly",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: `${error.message}` || "Something went wrong",
    });
  }
};
const getAllMessages = (req, res) => {
  try {
    Message.find({ receiver: "N/A" }, (err, message) => {
      if (message.length === 0) {
        return res.status(404).json({
          message: "no mesages found",
        });
      }

      return res.status(200).json({
        message: `${message.length} message(s) found`,
        message,
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

const getUserMessages = (req, res) => {
  const { email } = req.params;
  try {
    Message.find({ receiver: email }, (err, message) => {
      if (message.length === 0) {
        return res.status(404).json({
          message: "no mesages found",
        });
      }

      return res.status(200).json({
        message: `${message.length} message(s) found`,
        message,
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

const deleteMessage = (req, res) => {
  const { id } = req.params;

  Message.findOne({ id }, (err, message) => {
    if (err) {
      return res.status(500).json({
        message: err,
      });
    }
    if (!message) {
      return res.status(404).json({
        message: "message not found",
      });
    }

    Message.deleteOne({ id }, (error, result) => {
      if (error) {
        return res.status(500).json({
          message: error,
        });
      }

      if (result) {
        return res.status(200).json({
          message: "message deleted successfully",
        });
      }
    });
  });
};

module.exports = {
  sendMessage,
  deleteMessage,
  getAllMessages,
  getUserMessages,
};
