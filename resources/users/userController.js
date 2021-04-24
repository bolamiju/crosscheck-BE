const bcrypt = require("bcryptjs");
const fetch = require("node-fetch");
const { OAuth2Client } = require("google-auth-library");
const { v4 } = require("uuid");
const nodemailer = require("nodemailer");
const nodeMailerSendgrid = require("nodemailer-sendgrid");
const validation = require("./user.validation");
const Users = require("./users.model");
const AuthHelper = require("./auth");

const { genSaltSync, hashSync } = bcrypt;
const client = new OAuth2Client(process.env.GOOGLE_APP_ID);

const register = async (req, res) => {
  try {
    const { error } = validation.validateUser(req.body);

    if (error) {
      return res.status(422).json({
        status: 422,
        error: error.details[0].message,
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      country,
      organizationName,
      password,
      userType,
      companyWebsite,
      accountType,
    } = req.body;

    const userExist = await Users.findOne({ email });

    if (userExist) {
      return res.status(409).json({
        status: 409,
        message: "user already exist",
      });
    }

    // Insert a new user
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);

    const user = new Users({
      firstName,
      organizationName,
      phone,
      lastName,
      email,
      country,
      companyWebsite,
      accountType,
      userType,
      password: hash,
    });

    await user.save();
    const userDetails = AuthHelper.Auth.toAuthJSON(user);
    const transporter = nodemailer.createTransport(
      nodeMailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY,
      })
    );

    const mailOptions = {
      from: "support@crosscheck.africa",
      to: `${email}`,
      subject: "Account activation",
      html: `
      <div style="background:#F3F2ED; width:800px; padding:40px 30px 40px 20px">
      <div style="background:white; border-radius:10px; width:600px; padding:15px; margin:0 auto">
          <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%;margin:20px 40px"/>
      <p>Hi ${firstName},<p/> <br> 
      <strong style="font-family:'sans-serif; line-height:30px"> Thank you for creating an account on CrossCheck</strong>
      <p>Please click the button below to verify your email address</p>
     <button style="background:#0092e0; padding:10px 20px; border:1px solid #0092e0; border-radius:5px; color:white; font-weight:bold"> <a href="https://crosscheck.africa/verify/${email}" rel="​noopener noreferrer" target="_blank" style="text-decoration:none; color:white">Verify Email</a>  </button> 
     
     <p>Best Regards, <br/> The CrossCheck Team</p>
     <p><a href="https://crosscheck.africa" target="_blank" rel="​noopener noreferrer" style={{textDecoration:'underline', cursor:'pointer'}}>www.crosscheck.africa</a></p>
     </div>
     </div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.send(error);
      } else {
        return res.status(201).json({
          message: "Please check your email for an activation link",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error,
    });
  }
};

const verifyAccount = async (req, res) => {
  const { email } = req.params;
  try {
    await Users.findOne({ email }, function (err, result) {
      if (!result) {
        return res.sendStatus(404).json({
          message: "user not found",
        });
      }
    });

    const confirmUser = await Users.updateOne(
      { email: email },
      { $set: { confirmed: true } }
    );
    if (confirmUser) {
      return res.status(200).json({
        message: "user account activated",
        user: confirmUser,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

const login = async (req, res) => {
  try {
    const { error } = validation.validateLogin(req.body);

    if (error) {
      return res.status(422).json({
        status: 422,
        error: error.details[0].message,
      });
    }
    const { email, password } = req.body;

    const existingUser = await Users.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        status: 400,
        message: "invalid email or password",
      });
    }

    if (existingUser && existingUser.confirmed === false) {
      return res.status(400).json({
        status: 401,
        message: "Account not activated",
      });
    }

    const userPassword = await bcrypt.compareSync(
      password,
      existingUser.password
    );

    if (!userPassword) {
      return res.status(400).json({
        message: "invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Logged in successfully",
      user: AuthHelper.Auth.toAuthJSON(existingUser),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Could not login user",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log('email',email)
  const generatedToken = v4();
  try {
    Users.findOne({ email }, function (err, user) {
      if (!user) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      // const generatedToken = Math.floor(
      //   Math.random() * (99896 - 10122) + 10122
      // );

      user.resetPasswordToken = generatedToken; //use uuid instead
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      user.save();

      const transporter = nodemailer.createTransport(
        nodeMailerSendgrid({
          apiKey: process.env.SENDGRID_API_KEY,
        })
      );
      const mailOptions = {
        from: "support@crosscheck.africa",
        to: `${email}`,
        subject: "Password Reset",
        html: `<div style="background:#F3F2ED; width:800px; padding:40px 30px 40px 20px">
        <div style="background:white; border-radius:10px; width:600px; padding:25px; margin:0 auto">
        
            <img src="https://i.ibb.co/b6YjKTx/Cross-Check-Logo.png" alt="crosscheck-logo" style="width:75%;margin:20px 40px"/>
            <p>Hi ${user.firstName},
            <p>Someone (hopefully you) has requested a password reset for your crosscheck account. 
           <br/><br/>
           <strong>Please click the button below to reset your password</strong><br/><br/>

           <button style="background:#0092e0; padding:10px 20px; border:1px solid #0092e0; border-radius:5px;color:white; font-weight:bold; outline:none; cursor:pointer"><a href="https://crosscheck.africa/reset/${generatedToken}" target="_blank" rel="​noopener noreferrer" style="text-decoration:none; color:white">Reset Password </a></button><br/><br/>
               
           <strong>Please note that this link expires within an hour of receipt of this email.</strong>
           <br/><br/>
     <p>If you don't wish to reset your password, disregard this email and no action will be taken.</p>
     <br/><br/>
     <p>Best Regards, <br/> The CrossCheck Team</p>
           <a href="https://crosscheck.africa.app rel="​noopener noreferrer" target="_blank"" >www.crosscheck.africa</a>
           </div> 
           </div>
           </div>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          res.status(404).json({ message: error });
        } else {
          return res.status(201).json({
            message: "A password reset token has been sent to your email",
          });
        }
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Could not login user",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  try {
    await Users.findOne(
      {
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      },
      function (err, user) {
        if (!user) {
          return res.status(404).json({
            message: "Password reset token is invalid or has expired.",
          });
        }

        if (newPassword !== confirmPassword) {
          return res.status(404).json({
            message: "password do not match",
          });
        }
        const salt = genSaltSync(10);
        const hash = hashSync(newPassword, salt);
        user.password = hash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save();
        return res.status(200).json({
          message: "Password changed successfully",
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

const googleLogin = (req, res) => {
  const { tokenId } = req.body;

  client
    .verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_APP_ID,
    })
    .then(async (response) => {
      const { email, email_verified } = response.payload;

      if (email_verified) {
        Users.findOne({ email }, async function (err, user) {
          if (err) {
            return res.status(500).json({
              message: "Something went wrong",
            });
          }

          if (!user) {
            return res.status(404).json({
              message: "No account associated with this google account",
            });
          }
          if (user) {
            await Users.updateOne(
              { email: email },
              { $set: { confirmed: true } }
            );
          }
          return res.status(200).json({
            message: "Logged in successfully",
            user: AuthHelper.Auth.toAuthJSON(user),
          });
        });
      }
    });
};

const facebookLogin = (req, res) => {
  const { userID, accessToken } = req.body;

  let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=email&access_token=${accessToken}`;

  fetch(urlGraphFacebook, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((response) => {
      const { email } = response;
      if (email) {
        Users.findOne({ email }, async function (err, user) {
          if (err) {
            return res.status(500).json({
              message: "Something went wrong",
            });
          }

          if (!user) {
            return res.status(404).json({
              message: "No account associated with this google account",
            });
          }
          if (user) {
            await Users.updateOne(
              { email: email },
              { $set: { confirmed: true } }
            );
          }
          return res.status(200).json({
            message: "Logged in successfully",
            user: AuthHelper.Auth.toAuthJSON(user),
          });
        });
      }
    });
};


module.exports = {
  register,
  login,
  verifyAccount,
  forgotPassword,
  resetPassword,
  googleLogin,
  facebookLogin,
};
