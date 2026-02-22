const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = "An unexpected error occurred.";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    const parts = Object.values(err.errors || {})
      .map(e => e.message)
      .filter(Boolean);
    message = parts.length ? parts.join(" ") : "Validation failed.";
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid id format.";
  }

  console.error("Error:", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: err && err.message ? err.message : message
  });

  res.status(statusCode).json({
    error: {
      statusCode,
      message
    }
  });
}

module.exports = errorHandler;
