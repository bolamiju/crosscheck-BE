require("dotenv").config();
var path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./database");

const resources = require("./resources");
const expressMiddlewares = require("./utils/middlewares");

const app = express();

expressMiddlewares(app);

app.use("/uploads", express.static("uploads"));
// var dir = path.join(__dirname, "uploads");

// app.use(express.static(dir));

app.use(resources);

connectDB();

app.get("/", (req, res, next) => {
  try {
    res.status(200).json({
      message: "welcome to CrossCheck",
    });
  } catch (error) {
    next(new Error(error));
  }
});

module.exports = app;
