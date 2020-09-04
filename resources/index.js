const express = require("express");

const mainRouter = express.Router();

const users = require("./users/user.routes");
const institutions = require("./institutions/institution.routes");

mainRouter.use("/api/v1/users", users);
mainRouter.use("/api/v1/institutions", institutions);

module.exports = mainRouter;
