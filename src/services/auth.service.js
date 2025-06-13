const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt.helper');
const AppError = require('../utils/appError.helper');

exports.register = async (userData) => {
  // Check if user already exists
  const existUser = await UserModel.findOne({ email: userData.email });
  if (existUser) {
    throw new AppError('User already exists', 409);
  }

  // Destructure and normalize input
  const {
    name,
    email,
    password,
  } = userData;

  
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user document
  const newUser = new UserModel({
    name,
    email,
    password: hashedPassword,
  });

  // Save to DB
  const savedUser = await newUser.save();

  return { message: 'User registered successfully', data: savedUser };
};

exports.login = async (email, password) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken(user._id, user.email);
  return { token, user };
};
