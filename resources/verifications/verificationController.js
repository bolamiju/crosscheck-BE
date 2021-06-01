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
      institute_charge,
      our_charge,
      requester,
      email
    } = req.body;
    const { tranId } = req.params;
    const name = `${firstName} ${lastName}`;

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const date = `${year}-${month}-${day}`;

    // const userInfo = await Users.findOne({ email });
    // const userPaymentId = userInfo.paymentId
    // if( userPaymentId !== paymentId){
    //   return res.status(400).send({
    //     message: "Invalid payment ID",
    //   });
    // }

    const verification = new Verification({
      id,
      firstName,
      lastName,
      name,
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
      institute_charge,
      our_charge,
      requester,
      certImage: req.file.path.replace(/\\/g, "/"),
      tranId,
      
    });

    await verification.save();

    // await Users.updateOne(
    //   { email: email },
    //   { $set: { paymentId: v4() } }
    // );

    const transporter = nodemailer.createTransport(
      nodeMailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
      })
    );

    const adminMail = {
      from: "support@crosscheck.africa",
      to: "support@crosscheck.africa",
      subject: "New Order",
      html: `
     
      <div style="background:#F3F2ED;width:800px; padding:40px 30px 40px 20px">
      <div style="background:white; border-radius:10px; width:600px; padding:15px; margin:0 auto">
          <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%;margin:20px 40px"/>
          <p>Hi, <br>There is a new order for ${institution}. Please check your <a href="https://admincrosscheck.netlify.app/dashboard">dashboard</a> for details </p> 

          <p>Best Regards, <br/> The CrossCheck Team</p>
          <p><a href="https://crosscheck.africa" target="_blank" rel="​noopener noreferrer" style="text-decoration:underline; cursor:pointer">www.crosscheck.africa</a></p>
          </div>
          </div>`
    };

    transporter.sendMail(adminMail, (error, info) => {
      if (error) {
        res.send(error);
      } else {
        res.send("sent");
      }
    });

    const mailOptions = {
      from: "support@crosscheck.africa",
      to: `${email}`,
      subject: "Order Received",
      html: `
      <div style="background:#F3F2ED; width:800px; padding:40px 30px 40px 20px">
      <div style="background:white; border-radius:10px; width:600px; padding:15px; margin:0 auto">
          <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%;margin:20px 40px"/>
          <p>Hi ${requester},</p>
          <p style="line-height: 30px; font-family:sans-serif">We have received your education verification request for</p>

          <strong>${firstName} ${lastName}</strong>
          <p>${institution}</p>
          <p><strong>Request Id</strong>: ${id}</p>
          <br/><br/>
          <p>Best Regards <br/> The CrossCheck Team</p>
          <p><a href="https://crosscheck.africa" target="_blank" rel="​noopener noreferrer" style="text-decoration:none; cursor:pointer">www.crosscheck.africa</a></p>
      </div>
  </div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.send(error);
      } else {
        return res.status(201).json({
          message: "Request submitted"
        });
      }
    });
  } catch (error) {
    if (!req.file) {
      return res.status(400).send({
        message: "No file received or invalid file type",
        success: false
      });
    }
    return res.status(500).json({
      status: 500,
      error: `${error.message}` || "Something went wrong"
    });
  }
};

const getUserVerifications = (req, res) => {
  const { email } = req.params;
  try {
    Verification.find({ email }, (err, verifications) => {
      if (verifications.length === 0) {
        return res.status(404).json({
          message: "no verifications by email found"
        });
      }

      return res.status(200).json({
        message: `${verifications.length} verifications(s) found`,
        verifications
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong"
    });
  }
};

const getVerificationsByStatus = (req, res) => {
  const { status } = req.params;

  try {
    Verification.find({ status }, (err, verifications) => {
      if (verifications.length === 0) {
        return res.status(404).json({
          message: "no verifications found"
        });
      }

      return res.status(200).json({
        message: `${verifications.length} verifications(s) found`,
        verifications
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong"
    });
  }
};

const updateVerification = async (req, res) => {
  const today = new Date();
  const { id, email } = req.params;
  const { verificationStatus, updated_by } = req.body;
  let school;
  let name;
  let requester;
  let proof;
  if (verificationStatus === "completed") {
    proof = req.file.path.replace(/\\/g, "/");
  }
  try {
    await Verification.findOne({ id: id }, function (err, result) {
      if (!result) {
        return res.status(404).json({
          message: "verification not found"
        });
      } else {
        school = result.institution;
        name = result.firstName + " " + result.lastName;
        requester = result.requester;
      }
    });
    const updateVerification = await Verification.updateOne(
      { id: id },
      { $set: { status: verificationStatus, proof: proof, updated_by } }
    );
    if (updateVerification) {
      if (verificationStatus === "completed") {
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
          <div style="background:#F3F2ED;width:800px; padding:40px 30px 40px 20px">
          <div style="background:white; border-radius:10px; width:600px; padding:15px; margin:0 auto">
              <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%; margin:20px 40px"/>
              <p>Hi ${requester},</p>
              <p style="line-height: 30px; font-family:sans-serif;line-height: normal">The following verification request has been completed.</p> <br/>

              <strong>${name}</strong>
              <p>${school}</p>
              <p>Please login to view the result of your verification</p>
              <button style="background:#0092e0; padding:10px 20px; border:1px solid #0092e0; border-radius:5px;color:white; font-weight:bold; outline:none; cursor:pointer"><a href="https://crosscheck.africa/login" target="_blank" rel="​noopener noreferrer" style="text-decoration:none; color:white">View Verification </a></button><br/><br/>
              <br/><br/>
              <p>Best Regards, <br/> The CrossCheck Team</p>
              <p><a href="https://crosscheck.africa" target="_blank" rel="​noopener noreferrer" style="text-decoration:none; cursor:pointer">www.crosscheck.africa</a></p>
          </div>
      </div> 
          
          `
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            res.send(error);
          } else {
            console.log("sent");
          }
        });
        const doc = new Message({
          id,
          message: `Your verification with id ${id} has been completed`,
          subject: "Verification completed",
          dateTime: today,
          receiver: email
        });

        await doc.save();
      }

      return res.status(200).json({
        message: "verification updated",
        verification: updateVerification
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong"
    });
  }
};

const sendEmail = (req, res) => {
  const { email, requester } = req.params;
  const { message, subject, institution, name, id } = req.body;
  try{
  if (!message) {
    return res.status(404).json({
      message: "message body cannot be empty"
    });
  }

  const transporter = nodemailer.createTransport(
    nodeMailerSendgrid({
      apiKey: process.env.SENDGRID_API_KEY
    })
  );

  const mailOptions = {
    from: "support@crosscheck.africa",
    to: `${email}`,
    subject: `${subject}`,
    html: `
    <div style="background:#F3F2ED;width:800px; padding:40px 30px 40px 20px">
    <div style="background:white; border-radius:10px; width:600px; padding:15px; margin:0 auto">
        <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%; margin:20px 40px"/>
        <p>Hi ${requester},</p>
        <p style="line-height: 30px; font-family:sans-serif;line-height: normal"> ${message} </p>
        <br/>
        <strong> ${institution} </strong>
        <p> ${name} </p>
        <p> Request Id: ${id} </p>

        <p>Best Regards, <br/> The CrossCheck Team</p>
        <p><a href="https://crosscheck.africa" target="_blank" rel="​noopener noreferrer" style="text-decoration:none; cursor:pointer">www.crosscheck.africa</a></p>
    </div>
</div> 
    
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.send(error);
    } else {
      return res.status(200).json({
        message: "Email sent"
      });
    }
  });
}
catch(error){
  return res.status(500).json({
    error: error.message || "Something went wrong"
  });
}
};

module.exports = {
  requestVerification,
  getUserVerifications,
  getVerificationsByStatus,
  updateVerification,
  sendEmail
};
