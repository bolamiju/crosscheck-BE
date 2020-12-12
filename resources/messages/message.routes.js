const { Router } = require("express");
const router = Router();

const {
  sendMessage,
  deleteMessage,
  getAllMessages,
} = require("./messageController");

router.post("/sendMessage", sendMessage);
router.get("/", getAllMessages);
router.delete("/:id", deleteMessage);

module.exports = router;
