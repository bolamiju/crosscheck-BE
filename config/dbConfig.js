const dotenv = require('dotenv');

dotenv.config();

let connectionUrl = process.env.MONGO_URL;



module.exports = { connectionUrl };
