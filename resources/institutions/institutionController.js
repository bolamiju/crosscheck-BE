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
      institution: doc,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      error: `${error.message}` || "Something went wrong",
    });
  }
};

const getAllInstitutions = (req, res) => {
  try {
    Institution.find({}, (err, institution) => {
      if (institution.length === 0) {
        return res.status(404).json({
          message: "no institution found",
        });
      }

      return res.status(200).json({
        message: `${institution.length} institution(s) found`,
        institution,
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

const editInstitutionInfo = async (req, res) => {
  const updateparamters = req.body;
  const { name } = req.params;
  console.log("params", req.params);
  try {
    const institution = await Institution.findOne(
      { name },
      function (err, result) {
        if (!result) {
          return res.send(404).json({
            message: "Institution not found",
          });
        }
      }
    );

    if (!institution) {
      return res.status(404).json({
        message: "Institution not found",
      });
    }
    console.log(institution);
    const updatedInstitution = await Institution.updateOne(
      { name },
      { $set: updateparamters }
    );
    if (updatedInstitution) {
      return res.status(200).json({
        message: "Institution updated",
        university: updatedInstitution,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

const deleteInstitution = (req, res) => {
  const { _id } = req.params;
  console.log(_id);
  Institution.findOne({ _id }, (err, institution) => {
    if (err) {
      return res.status(500).json({
        message: err,
      });
    }
    if (!institution) {
      return res.status(404).json({
        message: "institution not found",
      });
    }

    Institution.deleteOne({ _id }, (error, result) => {
      if (error) {
        return res.status(500).json({
          message: error,
        });
      }

      if (result) {
        return res.status(200).json({
          message: "institution deleted successfully",
        });
      }
    });
  });
};

const getInstitutionByCountry = (req, res) => {
  const { country } = req.params;
  try {
    Institution.find({ country }, (err, institution) => {
      if (institution.length === 0) {
        return res.status(404).json({
          message: "no institution found",
        });
      }

      return res.status(200).json({
        message: `${institution.length} institution(s) found`,
        institution,
      });
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
};

module.exports = {
  addInstitution,
  getAllInstitutions,
  editInstitutionInfo,
  deleteInstitution,
  getInstitutionByCountry,
};
