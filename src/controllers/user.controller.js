const Response = require('../utils/response.helper');
const { UserListResource } = require('../resources/user.resource');
const userService = require('../services/user.service');

const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return Response.success(
      res,
      'Users retrieved successfully',
      UserListResource(users)
    );
  } catch (error) {
    return Response.error(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  getUsers,
};
