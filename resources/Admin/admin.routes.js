const express = require("express");

const router = express.Router();

const adminController = require("./adminController");
const {verifyToken} = require("../../utils/validateToken")
const { createAdmin, login } = adminController;

router.post("/register",verifyToken, createAdmin);
router.post("/login", login);

module.exports = router;