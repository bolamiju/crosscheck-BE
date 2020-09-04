const Institution = require("./institution.model");
const validation = require("./institution.validation");

const addInstitution = async (req, res) => {
  try {
    const { error } = validation.validateInstitution(req.body);

    if (error) {
      return res.status(422).json({
        message: error.details[0].message,
      });
    }

    // const { userId } = req;

    let { name, amount, state, country, category } = req.body;

    const institutionExist = await Institution.findOne({ name });

    if (institutionExist) {
      return res.status(409).json({
        status: 409,
        message: "institution already exist",
      });
    }

    const doc = new Institution({
      name,
      amount,
      state,
      country,
      category,
    });

    await doc.save();

    return res.status(201).json({
      message: "Institution added successfuly",
      prescription: doc,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: `${error.message}` || "Something went wrong",
    });
  }
};

module.exports = { addInstitution };
