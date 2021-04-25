const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const { v4 } = require("uuid");
const nodemailer = require("nodemailer");
const nodeMailerSendgrid = require("nodemailer-sendgrid");
const Admin = require("./admin.model");
const AuthHelper = require("../users/auth.js");

const { genSaltSync, hashSync } = bcrypt;
const createAdmin = async (req, res) => {
  // const {}
  try {
    const { firstName, lastName, email, password, userType } = req.body;

    const userExist = await Admin.findOne({ email });

    if (userExist) {
      return res.status(409).json({
        status: 409,
        message: "user already exist"
      });
    }

    // Insert a new user
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);

    const user = new Admin({
      firstName,
      lastName,
      email,
      userType,
      password: hash
    });

    await user.save();
    const userDetails = AuthHelper.Auth.toAuthJSON(user);

    const transporter = nodemailer.createTransport(
      nodeMailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY
      })
    );

    const mailOptions = {
      from: "support@crosscheck.africa",
      to: `${email}`,
      subject: "Account activation",
      html: `
      <div style="background:#F3F2ED; width:800px; padding:40px 30px 40px 20px">
      <div style="background:white; border-radius:10px; width:600px; padding:25px; margin:0 auto">
      
          <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%;margin:20px 40px"/>
      <p>Hi ${firstName},</p> <br>
      <p> you have been created as an admin.
      You can access the admin dashboard with details below</p> <br>
      Email: ${email} <br>
      Password: ${password}</div> 
      </div>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.send(error);
      } else {
        return res.status(201).json({
          message: "Account created successfully",
          user: { ...userDetails, userType: user.userType }
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong"
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await Admin.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        status: 400,
        message: "invalid email or password"
      });
    }

    const userPassword = await bcrypt.compareSync(password, existingUser.password);

    if (!userPassword) {
      return res.status(400).json({
        message: "invalid email or password"
      });
    }
    const userDetails = AuthHelper.Auth.toAuthJSON(existingUser);

    return res.status(200).json({
      message: "Logged in successfully",
      user: { ...userDetails, userType: existingUser.userType }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Could not login user"
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const generatedToken = v4();
  try {
    Admin.findOne({ email }, function (err, user) {
      if (!user) {
        return res.status(404).json({
          message: "user not found"
        });
      }

      user.resetPasswordToken = generatedToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      user.save();

      const transporter = nodemailer.createTransport(
        nodeMailerSendgrid({
          apiKey: process.env.SENDGRID_API_KEY
        })
      );
      const mailOptions = {
        from: "support@crosscheck.africa",
        to: `${email}`,
        subject: "Password Reset",
        html: `
        <div style="background:#F3F2ED; width:800px; padding:40px 30px 40px 20px">
        <div style="background:white; border-radius:10px; width:600px; padding:25px; margin:0 auto">
        
            <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%;margin:20px 40px"/>
            <p>Hi ${user.firstName},
            <p>Someone (hopefully you) has requested a password reset for your crosscheck account. 
           <br/><br/>
           <strong>Please click the button below to reset your password</strong><br/><br/>

           <button style="background:#0092e0; padding:10px 20px; border:1px solid #0092e0; border-radius:5px;color:white; font-weight:bold; outline:none; cursor:pointer"><a href="https://admincrosscheck.netlify.app/resetpassword/${generatedToken}" target="_blank" rel="​noopener noreferrer" style="text-decoration:none; color:white">Reset Password </a></button><br/><br/>
               
           <strong>Please note that this link expires within an hour of receipt of this email.</strong>
           <br/><br/>
     <p>If you don't wish to reset your password, disregard this email and no action will be taken.</p>
     <br/><br/>
     <p>Best Regards, <br/> The CrossCheck Team</p>
           <a href="https://crosscheck.africa.app rel="​noopener noreferrer" target="_blank"" >www.crosscheck.africa</a>
           </div> 
           </div>
           </div>
            `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(404).json({ message: error });
        } else {
          return res.status(200).json({
            message: "A password reset token has been sent to your email"
          });
        }
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Could not login user"
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  try {
    await Admin.findOne(
      {
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      },
      function (err, user) {
        if (!user) {
          return res.status(404).json({
            message: "Password reset token is invalid or has expired."
          });
        }

        if (newPassword !== confirmPassword) {
          return res.status(404).json({
            message: "password do not match"
          });
        }
        const salt = genSaltSync(10);
        const hash = hashSync(newPassword, salt);
        user.password = hash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save();
        return res.status(200).json({
          message: "Password changed successfully"
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong"
    });
  }
};

const getAdmins = (req, res) => {
  const { status } = req.params;

  try {
    Admin.find({ userType: "admin" }, (err, admins) => {
      if (admins.length === 0) {
        return res.status(404).json({
          message: "no admin found"
        });
      }

      return res.status(200).json({
        message: `${admin.length} admin(s) found`,
        admins
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong"
    });
  }
};

const removeAdmin = (req, res) => {
  const { _id } = req.params;
  Admin.findOne({ _id }, (err, admin) => {
    if (err) {
      return res.status(500).json({
        message: err
      });
    }
    if (!admin) {
      return res.status(404).json({
        message: "institution not found"
      });
    }

    Admin.deleteOne({ _id }, (error, result) => {
      if (error) {
        return res.status(500).json({
          message: error
        });
      }

      if (result) {
        return res.status(200).json({
          message: "admin removed successfully"
        });
      }
    });
  });
};

module.exports = {
  createAdmin,
  login,
  forgotPassword,
  resetPassword,
  getAdmins,
  removeAdmin
};
