const Joi = require("joi");

module.exports = {
  validateInstitution(institution) {
    const schema = {
      name: Joi.string().min(2).max(80).required(),
      amount: Joi.number().required(),
      state: Joi.string().min(2).max(80).required(),
      country: Joi.string().min(3).max(20).required(),
      category: Joi.string()
        .min(3)
        .max(20)
        .valid("state", "federal", "private")
        .required(),
    };
    return Joi.validate(institution, schema);
  },
};
