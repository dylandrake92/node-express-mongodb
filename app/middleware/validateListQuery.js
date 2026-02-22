const ApiError = require("../utils/ApiError");
const escapeRegex = require("../utils/escapeRegex");

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

// Hard limits to prevent abuse (huge responses / huge skip values).
const MAX_PAGE_SIZE = 100;
const MAX_PAGE = 100000;

const ALLOWED_SORT_FIELDS = new Set(["createdAt", "updatedAt", "title", "published"]);
const ALLOWED_SORT_DIRS = new Set(["asc", "desc"]);

function parsePositiveInt(value, { fieldName, defaultValue, min = 1, max } = {}) {
  if (value === undefined) return defaultValue;

  const n = Number.parseInt(String(value), 10);
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    throw new ApiError(400, `${fieldName} must be an integer.`);
  }
  if (n < min) {
    throw new ApiError(400, `${fieldName} must be >= ${min}.`);
  }
  if (max !== undefined && n > max) {
    throw new ApiError(400, `${fieldName} must be <= ${max}.`);
  }
  return n;
}

function parseBoolean(value, fieldName) {
  if (value === undefined) return undefined;

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;

  throw new ApiError(400, `${fieldName} must be a boolean (true/false).`);
}

function validateTutorialListQuery(req, res, next) {
  try {
    const page = parsePositiveInt(req.query.page, {
      fieldName: "page",
      defaultValue: DEFAULT_PAGE,
      min: 1,
      max: MAX_PAGE
    });

    const pageSize = parsePositiveInt(req.query.pageSize, {
      fieldName: "pageSize",
      defaultValue: DEFAULT_PAGE_SIZE,
      min: 1,
      max: MAX_PAGE_SIZE
    });

    const sortFieldRaw = req.query.sort;
    const sortField =
      sortFieldRaw === undefined ? "createdAt" : String(sortFieldRaw).trim();

    if (!ALLOWED_SORT_FIELDS.has(sortField)) {
      throw new ApiError(
        400,
        `sort must be one of: ${Array.from(ALLOWED_SORT_FIELDS).join(", ")}.`
      );
    }

    const dirRaw = req.query.dir;
    const dir = dirRaw === undefined ? "desc" : String(dirRaw).trim().toLowerCase();

    if (!ALLOWED_SORT_DIRS.has(dir)) {
      throw new ApiError(400, "dir must be 'asc' or 'desc'.");
    }

    const titleRaw = req.query.title;
    let title;
    if (titleRaw !== undefined) {
      if (typeof titleRaw !== "string") {
        throw new ApiError(400, "title must be a string.");
      }
      title = titleRaw.trim();
      if (title.length === 0) {
        throw new ApiError(400, "title cannot be empty.");
      }
      if (title.length > 100) {
        throw new ApiError(400, "title is too long (max 100 characters).");
      }
    }

    const published = parseBoolean(req.query.published, "published");

    // Build structured filter object (data structure) from query params.
    const filter = {};
    if (title !== undefined) {
      // Escape user input to avoid regex injection and keep query safe.
      filter.title = { $regex: new RegExp(escapeRegex(title), "i") };
    }
    if (published !== undefined) {
      filter.published = published;
    }

    const sort = { [sortField]: dir === "asc" ? 1 : -1 };

    req.listOptions = { page, pageSize, sortField, dir, filter, sort };
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = validateTutorialListQuery;
