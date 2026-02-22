const db = require("../models");
const Tutorial = db.tutorials;

const ApiError = require("../utils/ApiError");

async function listTutorials({ filter, sort, page, pageSize, sortField, dir }, res) {
  const skip = (page - 1) * pageSize;

  const [results, total] = await Promise.all([
    Tutorial.find(filter).sort(sort).skip(skip).limit(pageSize),
    Tutorial.countDocuments(filter)
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  res.send({
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    sort: { field: sortField, dir },
    results
  });
}

// Create and Save a new Tutorial
exports.create = async (req, res) => {
  const body = req.validatedBody || {};

  const tutorial = new Tutorial({
    title: body.title,
    description: body.description,
    published: body.published !== undefined ? body.published : false
  });

  const data = await tutorial.save();
  res.status(201).send(data);
};

// Retrieve Tutorials from the database (filtering, sorting, pagination)
exports.findAll = async (req, res) => {
  const opts = req.listOptions || {
    page: 1,
    pageSize: 20,
    sortField: "createdAt",
    dir: "desc",
    filter: {},
    sort: { createdAt: -1 }
  };

  await listTutorials(opts, res);
};

// Find a single Tutorial with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  const data = await Tutorial.findById(id);
  if (!data) {
    throw new ApiError(404, `Not found Tutorial with id ${id}`);
  }

  res.send(data);
};

// Update a Tutorial by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const updateBody = req.validatedBody || {};

  const data = await Tutorial.findByIdAndUpdate(id, updateBody, { new: true });
  if (!data) {
    throw new ApiError(404, `Cannot update Tutorial with id=${id}. Tutorial was not found.`);
  }

  res.send({ message: "Tutorial was updated successfully.", tutorial: data });
};

// Delete a Tutorial with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  const data = await Tutorial.findByIdAndDelete(id);
  if (!data) {
    throw new ApiError(404, `Cannot delete Tutorial with id=${id}. Tutorial was not found.`);
  }

  res.send({ message: "Tutorial was deleted successfully!" });
};

// Delete all Tutorials from the database.
exports.deleteAll = async (req, res) => {
  const data = await Tutorial.deleteMany({});
  res.send({ message: `${data.deletedCount} Tutorials were deleted successfully!` });
};

// Find all published Tutorials (supports filtering, sorting, pagination)
exports.findAllPublished = async (req, res) => {
  const baseOpts = req.listOptions || {
    page: 1,
    pageSize: 20,
    sortField: "createdAt",
    dir: "desc",
    filter: {},
    sort: { createdAt: -1 }
  };

  const opts = {
    ...baseOpts,
    filter: { ...baseOpts.filter, published: true }
  };

  await listTutorials(opts, res);
};
