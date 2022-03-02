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
      requester,
      email,
    } = req.body;
    // const { tranId } = req.params

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
      requester
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
      html: ` <div style="background:#F3F2ED;width:800px; padding:40px 30px 40px 20px">
      <div style="background:white; border-radius:10px; width:600px; padding:15px; margin:0 auto">
          <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%;margin:20px 40px"/>
      <p>Hi  <br>There is a new transcript order for. Please check your dashboard for details </p> 

      <strong>${firstName} ${lastName}</strong>
      <p>${institution}</p>
      <p><strong>Request Id</strong>: ${id}</p>
      <br/><br/>
      <p>Best Regards, <br/> The CrossCheck Team</p>
      <p><a href="https://crosscheck.africa" target="_blank" rel="​noopener noreferrer" style="text-decoration:none; cursor:pointer">www.crosscheck.africa</a></p>
      </div>
      </div>`,
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
      <div style="background:#F3F2ED;width:800px; padding:40px 30px 40px 20px">
      <div style="background:white; border-radius:10px; width:600px; padding:15px; margin:0 auto">
          <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%;margin:20px 40px"/>
          <p>Hi ${requester},</p>
          <p style="line-height: 30px; font-family:sans-serif;line-height: normal">We have received your trancript request for</p> <br/>

          <strong>${firstName} ${lastName}</strong>
          <p>${institution}</p>
          <p><strong>Request Id</strong>: ${id}</p>
          <br/><br/>
          <p>Best Regards, <br/> The CrossCheck Team</p>
          <p><a href="https://crosscheck.africa" target="_blank" rel="​noopener noreferrer" style="text-decoration:none; cursor:pointer">www.crosscheck.africa</a></p>
      </div>
  </div> `,
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
  const { transcriptStatus,updated_by } = req.body;

  const today = new Date();

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
          { $set: { status: transcriptStatus, updated_by } }
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
              subject: "Transcript completed",
              html: `
              <div style="background:#F3F2ED; width:800px; padding:40px 30px 40px 20px">
              <div style="background:white; border-radius:10px; width:600px; padding:15px; margin:0 auto">
                  <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%;margin:20px 40px"/>
                  <p>Hi ${result.requester},</p>
                  <p style="line-height: 30px; font-family:sans-serif;line-height: normal">The following transcript request has been completed.</p> <br/>

                  <strong>${result.firstName} ${result.lastName}</strong>
                  <p>${result.institution}</p>
                  <p>Please login to your dashboard to view this request</p>
                  <button style="background:#0092e0; padding:10px 20px; border:1px solid #0092e0; border-radius:5px;color:white; font-weight:bold; outline:none; cursor:pointer"><a href="https://crosscheck.africa/login" target="_blank" rel="​noopener noreferrer" style="text-decoration:none; color:white">View Verification </a></button><br/><br/>
                  <br/><br/>
                  <p>Best Regards, <br/> The CrossCheck Team</p>
                  <p><a href="https://crosscheck.africa" target="_blank" rel="​noopener noreferrer" style="text-decoration:none; cursor:pointer">www.crosscheck.africa</a></p
              </div>
          </div>`,
             
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
              dateTime: today
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
