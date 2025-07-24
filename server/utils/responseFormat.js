function sendSuccess(res, data = null, message = '', meta = null, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}

function sendError(res, message = 'Server Error', statusCode = 500, errors = null) {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
