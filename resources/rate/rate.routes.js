const { Router } = require("express");
const router = Router();

const {postRate,getRate,editRate
} = require("./rateController");

router.post("/postRate", postRate);
router.get("/getRate", getRate);
router.put('/edit',editRate)

module.exports = router;
