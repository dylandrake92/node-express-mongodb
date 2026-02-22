const request = require("supertest");
const db = require("../app/models");

let app;

beforeAll(async () => {
  // Increase hook timeout because DB connections can take a moment on Windows.
  // (Jest default is 5000ms)
}, 30000);

beforeAll(async () => {
  process.env.NODE_ENV = "test";

  // Point to your local MongoDB for tests.
  // You can override this in CMD before running tests if needed.
  process.env.MONGODB_URL =
    process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/bezkoder_db_test";

  db.url = process.env.MONGODB_URL;

  // Load the Express app after env vars are set
  app = require("../app/app");

  await db.mongoose.connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Start clean each run
  await db.tutorials.deleteMany({});
}, 30000);

afterAll(async () => {
  try {
    await db.tutorials.deleteMany({});
    await db.mongoose.connection.close();
  } catch (e) {
    // If close fails, allow Jest to exit anyway
  }
}, 30000);

describe("Tutorial API", () => {
  test("GET / returns welcome message", async () => {
    const res = await request(app).get("/").expect(200);
    expect(res.body).toHaveProperty("message");
  });

  test("POST /api/tutorials returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/api/tutorials")
      .send({ description: "no title" })
      .expect(400);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("message");
  });

  test("POST /api/tutorials creates a tutorial (201)", async () => {
    const res = await request(app)
      .post("/api/tutorials")
      .send({ title: "Test Tutorial", description: "A test", published: false })
      .expect(201);

    expect(res.body).toHaveProperty("title", "Test Tutorial");
    expect(res.body).toHaveProperty("description", "A test");
    expect(res.body).toHaveProperty("id");
  });

  test("PUT /api/tutorials/:id updates only allowed fields", async () => {
    const created = await request(app)
      .post("/api/tutorials")
      .send({ title: "Original", description: "v1", published: false })
      .expect(201);

    const id = created.body.id;

    const updated = await request(app)
      .put(`/api/tutorials/${id}`)
      .send({ title: "Updated", unexpectedField: "ignored" })
      .expect(200);

    expect(updated.body).toHaveProperty("message");
    expect(updated.body).toHaveProperty("tutorial");
    expect(updated.body.tutorial).toHaveProperty("title", "Updated");
    expect(updated.body.tutorial).not.toHaveProperty("unexpectedField");
  });
});
