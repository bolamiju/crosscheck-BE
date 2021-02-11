const Joi = require("joi");

module.exports = {
  validateInstitution(institution) {
    const schema = {
      name: Joi.string().min(2).max(80).required(),
      our_charge: Joi.number().required(),
      institute_charge:Joi.number().required(),
      transcript_fee:Joi.number().required(),
      state: Joi.string().min(2).max(80).required(),
      country: Joi.string().min(3).max(20).required(),
    };
    return Joi.validate(institution, schema);
  },
};
