const express = require("express");

const router = express.Router();

const institutionController = require("./institutionController");
const { verifyToken, validateAdmin } = require("../../utils/validateToken");

const { addInstitution } = institutionController;

router.post("/add", verifyToken, validateAdmin, addInstitution);

module.exports = router;
