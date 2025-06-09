const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    status: success,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

exports.success = (res, message = 'Success', data = null, code = 200) => {
  return sendResponse(res, code, true, message, data);
};

exports.created = (
  res,
  message = 'Resource created successfully',
  data = null
) => {
  return sendResponse(res, 201, true, message, data);
};

exports.error = (res, message = 'Something went wrong', code = 500) => {
  return sendResponse(res, code, false, message);
};

exports.notFound = (res, message = 'Resource not found') => {
  return sendResponse(res, 404, false, message);
};

exports.unauthorized = (res, message = 'Unauthorized access') => {
  return sendResponse(res, 401, false, message);
};

exports.conflict = (res, message = 'Conflict resource exists') => {
  return sendResponse(res, 409, false, message);
};
