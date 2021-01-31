const express = require("express");

const mainRouter = express.Router();

const users = require("./users/user.routes");
const institutions = require("./institutions/institution.routes");
const verification = require("./verifications/verification.routes");
const transcript = require("./transcript/transcript.routes");
const message = require("./messages/message.routes");
const rate = require("./rate/rate.routes");

mainRouter.use("/api/v1/users", users);
mainRouter.use("/api/v1/institutions", institutions);
mainRouter.use("/api/v1/verifications", verification);
mainRouter.use("/api/v1/transcript", transcript);
mainRouter.use("/api/v1/message", message);
mainRouter.use('/api/v1/rate',rate)

module.exports = mainRouter;
