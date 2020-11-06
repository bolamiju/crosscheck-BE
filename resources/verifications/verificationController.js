const Verification = require("./verification.model");

const requestVerification = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      studentId,
      course,
      qualification,
      classification,
      admissionYear,
      graduationYear,
      enrollmentStatus,
      institution,
      status,
      // amount
    } = req.body;


    const verification = new Verification({
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      studentId,
      course,
      qualification,
      classification,
      admissionYear,
      graduationYear,
      enrollmentStatus,
      institution,
      status,
      certImage: req.file.path.replace(/\\/g, "/"),
    });

 
    await verification.save();

    return res.status(201).json({
      message: "Request submitted",
    });
  } catch (error) {
    if (!req.file) {
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
  requestVerification
};
