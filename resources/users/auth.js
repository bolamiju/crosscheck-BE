const jwt = require('jsonwebtoken');

const Auth = {
  toAuthJSON(user) {
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationName: user.organizationName,
      email: user.email,
      phone:user.phone,
      country: user.country,
      token: this.generateToken(user),
    };
  },

  generateToken(user) {
    const payload = {
      id: user._id,
      paymentId: user.paymentId

    };

    const options = {
      expiresIn: '24h',
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, options);
  
    return token;
  },
};

module.exports = { Auth };
