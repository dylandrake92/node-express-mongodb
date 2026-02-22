const router = require("express").Router();

const tutorials = require("../controllers/tutorial.controller.js");
const asyncHandler = require("../middleware/asyncHandler");
const validateTutorialListQuery = require("../middleware/validateListQuery");
const {
  validateCreateTutorial,
  validateUpdateTutorial
} = require("../middleware/validateTutorial");

// Create a new Tutorial
router.post("/", validateCreateTutorial, asyncHandler(tutorials.create));

// Retrieve all Tutorials (filtering, sorting, pagination)
router.get("/", validateTutorialListQuery, asyncHandler(tutorials.findAll));

// Retrieve all published Tutorials (filtering, sorting, pagination)
router.get("/published", validateTutorialListQuery, asyncHandler(tutorials.findAllPublished));

// Retrieve a single Tutorial with id
router.get("/:id", asyncHandler(tutorials.findOne));

// Update a Tutorial with id
router.put("/:id", validateUpdateTutorial, asyncHandler(tutorials.update));

// Delete a Tutorial with id
router.delete("/:id", asyncHandler(tutorials.delete));

// Delete all Tutorials
router.delete("/", asyncHandler(tutorials.deleteAll));

module.exports = router;
