const { Router } = require("express");
const router = Router();

const {
  sendMessage,
  deleteMessage,
  getAllMessages,
  getUserMessages,
} = require("./messageController");

router.post("/sendMessage", sendMessage);
router.get("/:email", getUserMessages);
router.get("/", getAllMessages);
router.delete("/:id", deleteMessage);

module.exports = router;
