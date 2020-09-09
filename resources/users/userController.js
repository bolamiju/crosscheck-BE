const bcrypt = require("bcryptjs");
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
      from: "CrossCheck",
      to: `${email}`,
      subject: "Account activation",
      html: `
      <div>Hi ${firstName}, <br> Please click on 
      <a href="https://croscheck.herokuapp.com/api/v1/users/${userDetails.token}" rel="nofollow" target="_blank">this link</a> to complete registration </div> `,
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
  // const { status } = req.params;
  const updateparamters = req.body;
  console.log("params", req.params);
  const { userId } = req;
  try {
    await Users.findOne({ _id: userId }, function (err, result) {
      if (!result) {
        return res.send(404).json({
          message: "user not found",
        });
      }
    });
    const confirmUser = await Users.updateOne(
      { _id: userId },
      { $set: updateparamters }
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
        status: 400,
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

module.exports = { register, login, verifyAccount };
