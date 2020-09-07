const express = require("express");

const router = express.Router();

const institutionController = require("./institutionController");
const { verifyToken, validateAdmin } = require("../../utils/validateToken");

const { addInstitution, getAllInstitutions } = institutionController;

router.post("/add", verifyToken, validateAdmin, addInstitution);
router.get("/", verifyToken, getAllInstitutions);

module.exports = router;
