const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
cloudinary.config({
  cloud_name: "dafcwan35",
  api_key: "977328874171828",
  api_secret: "fDzlGOPkEzPa0HymptSXN4n5BXM"
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "crosscheck-uploads",
      format: "jpg",
      public_id: new Date().toISOString()
    };
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

const {
  requestVerification,
  getUserVerifications,
  getVerificationsByStatus,
  updateVerification, sendEmail
} = require("./verificationController");

router.post("/request/:tranId", upload.single("certImage"), requestVerification);
router.get("/byemail/:email", getUserVerifications);
router.post("/sendemail/:email/:requester",sendEmail)
router.get("/status/:status", getVerificationsByStatus);
router.put("/:id/:email", upload.single("proof"), updateVerification);

module.exports = router;
