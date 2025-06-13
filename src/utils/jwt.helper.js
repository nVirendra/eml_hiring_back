const jwt = require('jsonwebtoken');
const { ENV } = require('../config/env');

const generateToken = (userId,email) => {
  return jwt.sign({ userId, email }, ENV.JWT_SECRET, { expiresIn: '1d' });
};

const decodeToken = (token) => {
  try {
    jwt.verify(token, ENV.JWT_SECRET);
  } catch (error) {
    console.error('Invalide Token:', error);
    return null;
  }
};

module.exports = { generateToken, decodeToken };
