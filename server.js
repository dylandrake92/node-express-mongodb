const app = require("./app/app");
const db = require("./app/models");

// Set port, connect to DB, then listen for requests.
const PORT = process.env.PORT || 8080;

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log("Connected to the database!");

    // Ensure indexes exist (performance improvement for list and search endpoints).
    try {
      await db.tutorials.createIndexes();
      console.log("Indexes ensured.");
    } catch (e) {
      console.warn("Could not create indexes:", e && e.message ? e.message : e);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit(1);
  });
