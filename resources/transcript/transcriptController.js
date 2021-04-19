const Transcript = require("./transcript.model");
const nodemailer = require("nodemailer");
const nodeMailerSendgrid = require("nodemailer-sendgrid");
const Message = require("../messages/message.model");

const requestTranscript = async (req, res) => {
  try {
    const {
      id,
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
    const {tranId} = req.params

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const date = `${year}-${month}-${day}`;

    const name = `${firstName} ${lastName}`

    const transcript = new Transcript({
      id,
      firstName,
      lastName,
      name,
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
      tranId
    });
    await transcript.save();
    const transporter = nodemailer.createTransport(
      nodeMailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY,
      })
    );

    const adminMail = {
      from: "support@crosscheck.africa",
      to: "support@crosscheck.africa",
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
      from: "support@crosscheck.africa",
      to: `${email}`,
      subject: "Order Received",
      html: `
      <div>Hi ${firstName}, <br> We have received your transcript order with id ${id} for ${institution}  </div> `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error");
        res.send(error);
      } else {
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

const getTranscriptByStatus = (req, res) => {
  const { status } = req.params;

  try {
    Transcript.find({ status }, (err, transcripts) => {
      if (transcripts.length === 0) {
        return res.status(404).json({
          message: "no transcripts found",
        });
      }

      return res.status(200).json({
        message: `${transcripts.length} transcript(s) found`,
        transcripts,
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

const getUserTranscripts = (req, res) => {
  const { email } = req.params;
  try {
    Transcript.find({ email }, (err, transcripts) => {
      if (transcripts.length === 0) {
        return res.status(404).json({
          message: "no transcripts with email found",
        });
      }

      return res.status(200).json({
        message: `${transcripts.length} transcript(s) found`,
        transcripts,
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

const updateTranscript = async (req, res) => {
  const { transcriptId,email } = req.params;
  const { transcriptStatus } = req.body;

  try {
    await Transcript.findOne(
      { _id: transcriptId },
      async function (err, result) {
        if (!result) {
          return res.status(404).json({
            message: "transcript not found",
          });
        }
        const updateTranscript = await Transcript.updateOne(
          { _id: transcriptId },
          { $set: { status: transcriptStatus } }
        );
        if (updateTranscript) {
          if (transcriptStatus === "completed") {
            const transporter = nodemailer.createTransport(
              nodeMailerSendgrid({
                apiKey: process.env.SENDGRID_API_KEY
              })
            );
    
            const mailOptions = {
              from: "support@crosscheck.africa",
              to: `${email}`,
              subject: "Verification completed",
              html: `
              <div>Hi, <br> Your transcript request with id ${transcriptId} has been completed. Please refer to your dashboard for proof of completion</div> `,
              // attachments: [
              //   {
              //     path: proof
              //   }
              // ]
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log("error");
                res.send(error);
              } else {
                console.log("sent");
              }
            });
            const doc = new Message({
              id:transcriptId,
              message: `Your transcript request with id ${transcriptId} has been completed`,
              subject: "Transcript request completed",
              receiver: email,
            });

            await doc.save();
          }

          return res.status(200).json({
            message: "transcript updated",
            transcript: updateTranscript,
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

module.exports = {
  requestTranscript,
  getTranscriptByStatus,
  updateTranscript,
  getUserTranscripts,
};
