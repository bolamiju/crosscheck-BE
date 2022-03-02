const jwt = require("jsonwebtoken");
const AdminModel = require("../resources/Admin/admin.model");
const UserModel = require("../resources/users/users.model");

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "unauthorized, please log in" });
  }

  try {
    const { id } = await jwt.verify(token, process.env.SECRET_KEY);

    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      return res.status(401).json({
        message: "invalid token provided",
      });
    }

    //   if(user.userType !== "super_admin"){
    //    return res.status(401).json({
    //     message: "super admin feature only",
    //   });
    // }

    req.userId = id;
    return next();
  } catch (error) {
    return res.status(500).json({
      error: error || "see Something went wrong",
    });
  }
};

const accountActivationToken = async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const { id } = await jwt.verify(token, process.env.SECRET_KEY);

    const user = await UserModel.findOne({ _id: id });

    if (!user) {
      return res.status(401).json({
        message: "invalid token provided",
      });
    }

  

    req.userId = id;
    return next();
  } catch (error) {
    return res.status(500).json({
      error: error || "see Something went wrong",
    });
  }
};

const validateAdmin = async (req, res, next) => {
  const token = req.headers.authorization;

  try {
    const { id } = await jwt.verify(token, process.env.SECRET_KEY);

    const user = await UserModel.findOne({ _id: id });

    if (!user.userType || user.userType !== "admin") {
      return res.status(401).json({
        message: "Sorry, you cannot access this route",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      error: error || "see Something went wrong",
    });
  }
};

module.exports = { verifyToken, validateAdmin, accountActivationToken };
