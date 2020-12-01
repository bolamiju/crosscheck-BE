const { Router } = require("express");
const router = Router();

const { requestTranscript } = require("./transcriptController");

router.post("/request", requestTranscript);

module.exports = router;
