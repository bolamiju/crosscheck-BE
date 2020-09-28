const Verification = require("./verification.model");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
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
  if (
    !file.mimetype.includes("image/png") &&
    !file.mimetype.includes("image/jpeg")
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
const requestVerification = async (req, res) => {
  try {
    const {
      firstName,
      whatToRequest,
      school,
      amount,
      lastName,
      degreeTitle,
      degreeLevel,
    } = req.body;

    const verification = new Verification({
      firstName: req.files.firstName[0].path.replace(/\\/g, "/"),
      //   whatToRequest,
      //   school,
      //   amount,
      lastName,
      certImage: req.files.certImage[0].path.replace(/\\/g, "/"),
    });

    await verification.save();

    return res.status(201).json({
      message: "Request submitted",
    });
  } catch (error) {
    if (!req.files) {
      return res.status(400).send({
        message: "No file received or invalid file type",
        success: false,
      });
    }
    return res.status(500).json({
      status: 500,
      error: `${error.message}` || "Something went wrong",
    });
  }
};

module.exports = {
  requestVerification,
  upload,
};
