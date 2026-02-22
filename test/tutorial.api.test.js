const request = require("supertest");
const db = require("../app/models");

let app;

beforeAll(async () => {
  process.env.NODE_ENV = "test";

  app = require("../app/app");

  // Use a dedicated test database (must exist on your local MongoDB instance)
  db.url = "mongodb://127.0.0.1:27017/bezkoder_db_test";

  await db.mongoose.connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}, 30000);

afterAll(async () => {
  try {
    await db.mongoose.connection.dropDatabase();
    await db.mongoose.connection.close();
  } catch (e) {
    // Allow Jest to exit even if cleanup fails
  }
}, 30000);

describe("Tutorial API", () => {
  beforeEach(async () => {
    await db.tutorials.deleteMany({});
  });

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

  test("GET /api/tutorials supports pagination + sorting", async () => {
    const payloads = Array.from({ length: 25 }, (_, i) => ({
      title: `Tutorial ${String(i + 1).padStart(2, "0")}`,
      description: `desc ${i + 1}`,
      published: i % 2 === 0
    }));

    await db.tutorials.insertMany(payloads);

    const res = await request(app)
      .get("/api/tutorials?page=2&pageSize=10&sort=title&dir=asc")
      .expect(200);

    expect(res.body).toHaveProperty("total", 25);
    expect(res.body).toHaveProperty("page", 2);
    expect(res.body).toHaveProperty("pageSize", 10);
    expect(res.body).toHaveProperty("results");
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results).toHaveLength(10);

    expect(res.body.results[0]).toHaveProperty("title", "Tutorial 11");
  });

  test("GET /api/tutorials supports filtering by published=true", async () => {
    await db.tutorials.insertMany([
      { title: "A", published: true },
      { title: "B", published: false },
      { title: "C", published: true }
    ]);

    const res = await request(app).get("/api/tutorials?published=true").expect(200);

    expect(res.body).toHaveProperty("total", 2);
    expect(res.body.results).toHaveLength(2);
    for (const t of res.body.results) {
      expect(t).toHaveProperty("published", true);
    }
  });

  test("GET /api/tutorials returns 400 for invalid page", async () => {
    const res = await request(app).get("/api/tutorials?page=0").expect(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("message");
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
