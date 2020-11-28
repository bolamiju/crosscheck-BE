const express = require("express");

const router = express.Router();

const institutionController = require("./institutionController");
const { verifyToken, validateAdmin } = require("../../utils/validateToken");

const {
  addInstitution,
  getAllInstitutions,
  editInstitutionInfo,
  deleteInstitution,
  getInstitutionByCountry,
} = institutionController;

router.post("/add", addInstitution);
router.get("/", getAllInstitutions);
router.get("/:country", getInstitutionByCountry);
router.put("/:name", verifyToken, validateAdmin, editInstitutionInfo);
router.delete("/:_id", verifyToken, validateAdmin, deleteInstitution);

module.exports = router;
