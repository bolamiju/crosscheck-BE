const { Router } = require("express");
const router = Router();

const { sendMessage, deleteMessage } = require("./messageController");

router.post("/sendMessage", sendMessage);
router.delete("/:id", deleteMessage);

module.exports = router;
