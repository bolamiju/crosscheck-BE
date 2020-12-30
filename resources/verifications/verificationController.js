const Verification = require("./verification.model");
const nodemailer = require("nodemailer");
const nodeMailerSendgrid = require("nodemailer-sendgrid");
const Message = require("../messages/message.model");

const requestVerification = async (req, res) => {
  try {
    const {
      id,
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
      amount,
      email,
    } = req.body;

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const date = `${year}-${month}-${day}`;
    const verification = new Verification({
      id,
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
      date,
      email,
      amount,
      certImage: req.file.path.replace(/\\/g, "/"),
    });

    await verification.save();

    const transporter = nodemailer.createTransport(
      nodeMailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY,
      })
    );

    const adminMail = {
      from: "takere@trapezoidlimited.com",
      to: "tolaked@yahoo.com",
      subject: "New Order",
      html: `
      <div>Hi , <br>There is a new order for ${institution}  </div> `,
    };

    transporter.sendMail(adminMail, (error, info) => {
      if (error) {
        res.send(error);
      } else {
        console.log("sent");
      }
    });

    const mailOptions = {
      from: "takere@trapezoidlimited.com",
      to: `${email}`,
      subject: "Order Received",
      html: `
      <div>Hi ${firstName}, <br> We have receieved your education verification order for ${institution}  with id ${id}</div> `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error");
        res.send(error);
      } else {
        console.log("sent");
        return res.status(201).json({
          message: "Request submitted",
        });
      }
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
          message: "no verifications by email found",
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

const getVerificationsByStatus = (req, res) => {
  const { status } = req.params;

  try {
    Verification.find({ status }, (err, verifications) => {
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

const updateVerification = async (req, res) => {
  const { id, email } = req.params;
  const { verificationStatus } = req.body;
 const proof =  req.file.path.replace(/\\/g, "/"),

  try {
    await Verification.findOne({ _id: id }, function (err, result) {
      if (!result) {
        return res.sendStatus(404).json({
          message: "verification not found",
        });
      }
    });

    const updateVerification = await Verification.updateOne(
      { _id: id },
      { $set: { status: verificationStatus, proof } }
    );

    if (updateVerification) {
      if (verificationStatus === "completed") {
        const doc = new Message({
          id,
          message: `Your verification with id ${id} has been completed`,
          subject: "Verification completed",
          receiver: email,
        });

        await doc.save();
        const transporter = nodemailer.createTransport(
          nodeMailerSendgrid({
            apiKey: process.env.SENDGRID_API_KEY,
          })
        );
    
        const mailOptions = {
          from: "takere@trapezoidlimited.com",
          to: `${email}`,
          subject: "Verification completed",
          html: `
          <div>Hi, <br> Your verification request has been completed. Attached to this email is a proof of completion</div> `,
          attachments: [{
            path: proof
        }]
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error");
            res.send(error);
          } else {
            console.log("sent");
          }
        });
      }

      return res.status(200).json({
        message: "verification updated",
        verification: updateVerification,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

module.exports = {
  requestVerification,
  getUserVerifications,
  getVerificationsByStatus,
  updateVerification,
};
