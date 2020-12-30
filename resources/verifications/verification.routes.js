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
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads/");

//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       `${new Date().toISOString().replace(/:/g, "-")}${file.originalname
//         .split(" ")
//         .join("_")}`
//     );
//   },
// });

// const fileFilter = (req, file, cb) => {
//   console.log(file);
//   if (
//     !file.mimetype.includes("image/png") &&
//     !file.mimetype.includes("image/jpeg") &&
//     !file.mimetype.includes("application/pdf")
//   ) {
//     return cb(null, false);
//   }
//   cb(null, true);
// };

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
  updateVerification
} = require("./verificationController");

router.post("/request", upload.single("certImage"), requestVerification);
router.get("/byemail/:email", getUserVerifications);
router.get("/status/:status", getVerificationsByStatus);
router.put("/:id/:email", upload.single("proof"), updateVerification);

module.exports = router;
