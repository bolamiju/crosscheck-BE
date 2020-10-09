const express = require("express");
const multer = require("multer");
const Verification = require("./verification.model");
// const upload = multer({ dest: "uploads/" });

const router = express.Router();

const verificationController = require("./verificationController");
const { requestVerification, upload } = verificationController;

router.post(
  "/request",
  upload.fields([{ name: "certImage", maxCount: 1 }]),
  requestVerification
);

module.exports = router;
