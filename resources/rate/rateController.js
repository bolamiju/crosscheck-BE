const Rate = require("./rate.model");

const postRate = async (req, res) => {
  try {
    let { currency,current_rate } = req.body;


    const doc = new Rate({
      currency,
      current_rate,
    });

    await doc.save();

    return res.status(201).json({
      rate: "rate set",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: `${error.message}` || "Something went wrong",
    });
  }
};
const getRate = (req, res) => {
  try {
    Rate.find({ currency: "USD" }, (err, rate) => {
      if (rate.length === 0) {
        return res.status(404).json({
          message: "no rate found",
        });
      }

      return res.status(200).json({
        rate:rate,
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

const editRate = async (req, res) => {
    const { currency_rate } = req.body;

    try {
      const rate = await Rate.findOne({ currency }, function (err, result) {
        if (!result) {
          return res.send(404).json({
            message: "no currency found"
          });
        }
      });
  
      if (!rate) {
        return res.status(404).json({
          message: "rate not found"
        });
      }
      console.log(institution);
      const updatedRate = await Rate.updateOne({ currency:'USD' }, { $set: currency_rate });
      if (updatedRate) {
        return res.status(200).json({
          message: "rate updated",
          rate: updatedRate
        });
      }
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Something went wrong"
      });
    }
  };

module.exports = {
    postRate,getRate,editRate
}