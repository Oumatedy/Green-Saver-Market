class ApiResponse {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
  }

  static success(data, message = 'Success') {
    return new ApiResponse(true, message, data);
  }

  static error(message, errors = null) {
    return new ApiResponse(false, message, null, errors);
  }

  // Helper method to send response
  send(res, statusCode = 200) {
    return res.status(statusCode).json(this);
  }
}

module.exports = ApiResponse;
