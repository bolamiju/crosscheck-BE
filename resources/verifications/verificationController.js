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
      amount,
      email,
    } = req.body;
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const date = `${day}-${month}-${year}`;

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
      date,
      email,
      amount,
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

const getUserVerifications = (req, res) => {
  const { email } = req.params;
  try {
    Verification.find({ email }, (err, verifications) => {
      if (verifications.length === 0) {
        return res.status(404).json({
          message: "no verifications found",
        });
      }

      return res.status(200).json({
        message: `${verifications.length} verifications(s) found`,
        verifications,
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

module.exports = {
  requestVerification,
  getUserVerifications,
};
