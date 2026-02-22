const db = require("../models");
const Tutorial = db.tutorials;

const ApiError = require("../utils/ApiError");
const escapeRegex = require("../utils/escapeRegex");

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

// Retrieve all Tutorials from the database.
exports.findAll = async (req, res) => {
  const title = req.query.title;
  const condition = title
    ? { title: { $regex: new RegExp(escapeRegex(title), "i") } }
    : {};

  const data = await Tutorial.find(condition);
  res.send(data);
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

// Find all published Tutorials
exports.findAllPublished = async (req, res) => {
  const data = await Tutorial.find({ published: true });
  res.send(data);
};
