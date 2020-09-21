const bcrypt = require("bcryptjs");
const { v4 } = require("uuid");
const nodemailer = require("nodemailer");
const nodeMailerSendgrid = require("nodemailer-sendgrid");
const validation = require("./user.validation");
const Users = require("./users.model");
const AuthHelper = require("./auth");

const { genSaltSync, hashSync } = bcrypt;

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
      from: "takere@trapezoidlimited.com",
      to: `${email}`,
      subject: "Account activation",
      html: `
      <div>Hi ${firstName}, <br> Please click on
      <a href="http://localhost:3000/${email}" rel="nofollow" target="_blank">this link</a> to complete registration </div> `,
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
      console.log(result);
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
        message: "Invalid email or password",
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
  const generatedToken = v4();
  try {
    Users.findOne({ email }, function (err, user) {
      console.log("see user", user);
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
      console.log("gene", generatedToken);
      const mailOptions = {
        from: "takere@trapezoidlimited.com",
        to: `${email}`,
        subject: "Password Reset",
        html: `
            <div>Someone (hopefully you) has requested a password reset for your Heroku account. Follow the link below to set a new password:<br><br>
            <a href="https://lucid-nightingale-416243.netlify.app/reset/${generatedToken}" rel="nofollow" target="_blank">https://lucid-nightingale-416243.netlify.app/reset/${generatedToken}</a><br>

           <p>If you don't wish to reset your password, disregard this email and no action will be taken.</p><br>
           <p>CrossCheck Team</p>
           <a href="https://lucid-nightingale-416243.netlify.app rel="nofollow" target="_blank"" >https://crocheck.com</a>
           </div> `,
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

module.exports = {
  register,
  login,
  verifyAccount,
  forgotPassword,
  resetPassword,
};
