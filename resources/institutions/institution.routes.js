const express = require("express");

const router = express.Router();

const institutionController = require("./institutionController");

const { addInstitution } = institutionController;

router.post("/add", addInstitution);

module.exports = router;
