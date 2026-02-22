const express = require("express");
const cors = require("cors");

const tutorialRouter = require("./routes/turorial.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Reduce fingerprinting.
app.disable("x-powered-by");

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:8081"
};

app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// Mount API routes
app.use("/api/tutorials", tutorialRouter);

// Unknown routes -> 404
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

module.exports = app;