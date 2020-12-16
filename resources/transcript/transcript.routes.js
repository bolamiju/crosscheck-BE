const { Router } = require("express");
const router = Router();

const {
  requestTranscript,
  getUserTranscripts,
  getTranscriptByStatus,
  updateTranscript,
} = require("./transcriptController");

router.post("/request", requestTranscript);
router.get("/byemail/:email", getUserTranscripts);
router.get("/status/:status", getTranscriptByStatus);
router.put("/:transcriptId", updateTranscript);

module.exports = router;
