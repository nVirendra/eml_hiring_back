const authService = require('../services/auth.service');
const Response = require('../utils/response.helper');
const { UserResource } = require('../resources/user.resource');

const register = async (req, res) => {
  try {
    const userData = req.body;
    const result = await authService.register(userData);

    return Response.created(res, result.message, UserResource(result.data));
  } catch (error) {
    return Response.error(res, error.message, error.statusCode || 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return Response.success(res, 'Login successful', {
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    return Response.error(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  register,
  login,
};
