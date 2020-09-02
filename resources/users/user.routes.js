const express = require("express");

const router = express.Router();

const userController = require("./userController");

const { register } = userController;

router.post("/register", register);

module.exports = router;
