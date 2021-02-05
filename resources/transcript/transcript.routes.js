const { Router } = require("express");
const router = Router();

const {
  requestTranscript,
  getUserTranscripts,
  getTranscriptByStatus,
  updateTranscript,
} = require("./transcriptController");

router.post("/request/:tranId", requestTranscript);
router.get("/byemail/:email", getUserTranscripts);
router.get("/status/:status", getTranscriptByStatus);
router.put("/:transcriptId/:email", updateTranscript);

module.exports = router;
