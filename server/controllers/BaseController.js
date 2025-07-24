// controllers/BaseController.js

class BaseController {
  // The method subclasses must implement with their specific logic
  async executeImpl(req, res) {
    throw new Error('ExecuteImpl method not implemented');
  }

  // The method called by route handlers, wraps the implementation with error handling
  async execute(req, res) {
    try {
      await this.executeImpl(req, res);
    } catch (error) {
      console.error(`[BaseController]: Uncaught controller error`, error);
      this.fail(res, 'An unexpected error occurred');
    }
  }

  // Standard JSON response helper
  static jsonResponse(res, code, message) {
    return res.status(code).json({ message });
  }

  ok(res, dto) {
    if (dto) {
      res.type('application/json');
      return res.status(200).json(dto);
    } else {
      return res.sendStatus(200);
    }
  }

  created(res) {
    return res.sendStatus(201);
  }

  clientError(res, message) {
    return BaseController.jsonResponse(res, 400, message || 'Bad request');
  }

  unauthorized(res, message) {
    return BaseController.jsonResponse(res, 401, message || 'Unauthorized');
  }

  forbidden(res, message) {
    return BaseController.jsonResponse(res, 403, message || 'Forbidden');
  }

  notFound(res, message) {
    return BaseController.jsonResponse(res, 404, message || 'Not found');
  }

  conflict(res, message) {
    return BaseController.jsonResponse(res, 409, message || 'Conflict');
  }

  fail(res, error) {
    console.error(error);
    return res.status(500).json({
      message: error.toString(),
    });
  }
}

module.exports = BaseController;
