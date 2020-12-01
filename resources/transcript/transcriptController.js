const Transcript = require("./transcript.model");
const nodemailer = require("nodemailer");
const nodeMailerSendgrid = require("nodemailer-sendgrid");

const requestTranscript = async (req, res) => {
  console.log("na body", req.body);
  try {
    const {
      firstName,
      lastName,
      course,
      graduationYear,
      institution,
      address,
      zipCode,
      destination,
      destinationNumber,
      city,
      matricNo,
      amount,
      email,
    } = req.body;

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const date = `${day}-${month}-${year}`;

    const transcript = new Transcript({
      firstName,
      lastName,
      course,
      graduationYear,
      institution,
      address,
      zipCode,
      destination,
      destinationNumber,
      city,
      matricNo,
      amount,
      email,
      date,
    });
    await transcript.save();
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
      <div>Hi , <br>There is a new transcript order for ${institution}  </div> `,
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
      <div>Hi ${firstName}, <br> We have receieved your transcript order for ${institution}  </div> `,
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
    return res.status(500).json({
      status: 500,
      error: `${error.message}` || "Something went wrong",
    });
  }
};

module.exports = {
  requestTranscript,
};
