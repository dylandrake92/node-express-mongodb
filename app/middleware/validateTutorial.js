const ApiError = require("../utils/ApiError");

const ALLOWED_FIELDS = ["title", "description", "published"];

const TITLE_MAX_LEN = 100;
const DESC_MAX_LEN = 500;

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

  if (!body.title || typeof body.title !== "string") {
    return next(new ApiError(400, "Title is required."));
  }

  body.title = body.title.trim();

  if (body.title.length === 0) {
    return next(new ApiError(400, "Title is required."));
  }

  if (body.title.length > TITLE_MAX_LEN) {
    return next(
      new ApiError(400, `Title is too long (max ${TITLE_MAX_LEN} characters).`)
    );
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return next(new ApiError(400, "Description must be a string."));
    }
    body.description = body.description.trim();
    if (body.description.length > DESC_MAX_LEN) {
      return next(
        new ApiError(400, `Description is too long (max ${DESC_MAX_LEN} characters).`)
      );
    }
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
    if (typeof body.title !== "string") {
      return next(new ApiError(400, "Title must be a non-empty string."));
    }
    body.title = body.title.trim();
    if (body.title.length === 0) {
      return next(new ApiError(400, "Title must be a non-empty string."));
    }
    if (body.title.length > TITLE_MAX_LEN) {
      return next(
        new ApiError(400, `Title is too long (max ${TITLE_MAX_LEN} characters).`)
      );
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return next(new ApiError(400, "Description must be a string."));
    }
    body.description = body.description.trim();
    if (body.description.length > DESC_MAX_LEN) {
      return next(
        new ApiError(400, `Description is too long (max ${DESC_MAX_LEN} characters).`)
      );
    }
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
