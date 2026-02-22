const ApiError = require("../utils/ApiError");

const ALLOWED_FIELDS = ["title", "description", "published"];

function pickAllowedFields(body) {
  const result = {};
  if (!body || typeof body !== "object") return result;

  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      result[key] = body[key];
    }
  }
  return result;
}

function validateCreateTutorial(req, res, next) {
  const body = pickAllowedFields(req.body);

  if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
    return next(new ApiError(400, "Title is required."));
  }

  body.title = body.title.trim();

  if (body.description !== undefined && typeof body.description !== "string") {
    return next(new ApiError(400, "Description must be a string."));
  }

  if (body.published !== undefined && typeof body.published !== "boolean") {
    return next(new ApiError(400, "Published must be a boolean."));
  }

  req.validatedBody = body;
  return next();
}

function validateUpdateTutorial(req, res, next) {
  const body = pickAllowedFields(req.body);

  if (Object.keys(body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty."));
  }

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      return next(new ApiError(400, "Title must be a non-empty string."));
    }
    body.title = body.title.trim();
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    return next(new ApiError(400, "Description must be a string."));
  }

  if (body.published !== undefined && typeof body.published !== "boolean") {
    return next(new ApiError(400, "Published must be a boolean."));
  }

  req.validatedBody = body;
  return next();
}

module.exports = {
  validateCreateTutorial,
  validateUpdateTutorial,
  pickAllowedFields
};
