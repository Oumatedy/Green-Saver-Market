class ApiResponse {
  constructor(success, message = '', data = null, meta = null) {
    this.success = success;
    if (message) this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
  }

  static success(data = null, message = '', meta = null) {
    return new ApiResponse(true, message, data, meta);
  }

  static failure(message = '', data = null) {
    return new ApiResponse(false, message, data);
  }
}

module.exports = ApiResponse;
