const Joi = require("joi");

module.exports = {
  validateUser(user) {
    const schema = {
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      organizationName: Joi.string().min(2).max(50),
      email: Joi.string().required().email(),
      country: Joi.string().required(),
      phone: Joi.string().min(7).max(11).required(),
      accountType: Joi.string(),
      companyWebsite: Joi.string(),

      userType: Joi.string()
        .min(3)
        .max(15)
        .valid("admin", "individual", "organization"),
      password: Joi.string().min(6).max(50).required(),
    };
    return Joi.validate(user, schema);
  },
  validateLogin(user) {
    const schema = {
      email: Joi.string().min(2).max(50).required().email(),
      password: Joi.string().min(5).max(50).required(),
    };
    return Joi.validate(user, schema);
  },
};
