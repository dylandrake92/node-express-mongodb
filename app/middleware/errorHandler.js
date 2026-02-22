const ApiError = require("../utils/ApiError");

function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;

  const statusCode = isApiError ? err.statusCode : 500;

  console.error("Error:", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: err.message
  });

  res.status(statusCode).json({
    error: {
      statusCode,
      message: isApiError ? err.message : "An unexpected error occurred."
    }
  });
}

module.exports = errorHandler;
