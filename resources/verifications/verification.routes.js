const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "./uploads/");
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${new Date().toISOString().replace(/:/g, "-")}${file.originalname
        .split(" ")
        .join("_")}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  console.log(file);
  if (
    !file.mimetype.includes("image/png") &&
    !file.mimetype.includes("image/jpeg") &&
    !file.mimetype.includes("application/pdf")
  ) {
    return cb(null, false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const {
  requestVerification,
  getUserVerifications,
  getVerificationsByStatus,
  updateVerification,
} = require("./verificationController");

router.post("/request", upload.single("certImage"), requestVerification);
router.get("/byemail/:email", getUserVerifications);
router.get("/status/:status", getVerificationsByStatus);
router.put("/:id/:email", updateVerification);

module.exports = router;
