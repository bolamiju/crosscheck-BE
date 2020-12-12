const Message = require("./message.routes");

const sendMessage = async (req, res) => {
  try {
    let { id, message, subject } = req.body;

    const doc = new Message({
      id,
      message,
      subject,
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
};
