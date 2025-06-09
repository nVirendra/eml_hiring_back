const UserModel = require('../models/UserModel');

const AppError = require('../utils/appError.helper');

exports.getAllUsers = async () => {
  const users = await UserModel.find();
  if (!users) {
    throw new AppError('No users found', 404);
  }
  return users;
};
