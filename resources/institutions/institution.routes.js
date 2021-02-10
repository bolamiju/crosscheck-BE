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
  getInstitutionByCountryandName
} = institutionController;

router.post("/add", addInstitution);
router.get("/:name/:offset/:limit", getAllInstitutions);
router.get("/country/:country/:offset/:limit", getInstitutionByCountry);
router.get("/countryandName/:country/:name/:offset/:limit", getInstitutionByCountryandName);
router.put("/name/:name",  editInstitutionInfo);
router.delete("/:_id",  deleteInstitution);

module.exports = router;
