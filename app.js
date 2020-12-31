require("dotenv").config();
// const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./database");

const resources = require("./resources");
const expressMiddlewares = require("./utils/middlewares");

const app = express();

expressMiddlewares(app);

app.use("/uploads", express.static("uploads"));

// app.use(
//   cors({
//     origin: "*",
//     methods: "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
//     preflightContinue: false,
//     optionsSuccessStatus: 204
//   })
// );

// app.all("/*", (req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });
// // cross origin resource sharing middleware
// app.use(cors());

app.use(resources);

connectDB();

app.get("/", (req, res, next) => {
  try {
    res.status(200).json({
      message: "welcome to CrossCheck"
    });
  } catch (error) {
    next(new Error(error));
  }
});

module.exports = app;
