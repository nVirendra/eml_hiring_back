const dotenv = require('dotenv');
dotenv.config();

const ENV = {
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
};

module.exports = { ENV };
