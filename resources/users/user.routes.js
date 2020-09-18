const express = require("express");

const router = express.Router();

const userController = require("./userController");
const { accountActivationToken } = require("../../utils/validateToken");
const { register, login, verifyAccount } = userController;

router.post("/register", register);
router.post("/login", login);
router.put("/:email", verifyAccount);

module.exports = router;
