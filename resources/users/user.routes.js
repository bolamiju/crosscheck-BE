const express = require("express");

const router = express.Router();

const userController = require("./userController");
const { accountActivationToken } = require("../../utils/validateToken");
const {
  register,
  login,
  verifyAccount,
  forgotPassword,
  resetPassword,
} = userController;

router.post("/register", register);
router.post("/login", login);
router.post("/forgot", forgotPassword);
router.put("/:email", verifyAccount);
router.put("/reset/:token", resetPassword);

module.exports = router;
