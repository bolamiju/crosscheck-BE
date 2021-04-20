const express = require("express");

const router = express.Router();

const adminController = require("./adminController");
const {verifyToken} = require("../../utils/validateToken")
const { createAdmin, login, forgotPassword, resetPassword, getAdmins } = adminController;

router.post("/register",verifyToken, createAdmin);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", resetPassword);
router.get("/", getAdmins);


module.exports = router;