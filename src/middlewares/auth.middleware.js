const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // Adjust path if needed

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ status: false, message: 'Unauthorized: Token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optionally attach user to request
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ status: false, message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
