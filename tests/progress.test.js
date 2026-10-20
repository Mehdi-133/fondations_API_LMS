const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Enrollment = require("../models/Enrollment");
const ResourceProgress = require("../models/ResourceProgress");
const ModuleProgress = require("../models/ModuleProgress");
const { useTestAccounts } = require("./helpers/accounts");
const { createLearningFixture } = require("./helpers/learning");

describe("Learning progression", () => {
  useTestAccounts();
  let fixture;

  beforeEach(async () => {
    fixture = await createLearningFixture();
    await Enrollment.create({ learner: fixture.learner._id, course: fixture.course._id });
  });

  const consult = () => request(app).post(`/api/modules/${fixture.resource.id}/consult`)
    .set("Authorization", `Bearer ${fixture.token}`);
  const complete = (index = 0) => request(app)
    .post(`/api/modules/${fixture.modules[index].id}/complete`)
    .set("Authorization", `Bearer ${fixture.token}`);

  test("should require authentication to consult resources and complete modules", async () => {
    expect((await request(app).post(`/api/modules/${fixture.resource.id}/consult`)).statusCode).toBe(401);
    expect((await request(app).post(`/api/modules/${fixture.modules[0].id}/complete`)).statusCode).toBe(401);
  });

  test.each(["cancelled", "completed"])("should reject progression with a %s enrollment", async status => {
    await Enrollment.updateOne({ learner: fixture.learner._id }, { status });
    expect((await consult()).statusCode).toBe(403);
    expect((await complete()).statusCode).toBe(403);
    expect(await ResourceProgress.countDocuments({ learner: fixture.learner._id })).toBe(0);
    expect(await ModuleProgress.countDocuments({ learner: fixture.learner._id })).toBe(0);
  });

  test("should reject progression without enrollment", async () => {
    await Enrollment.deleteOne({ learner: fixture.learner._id });
    expect((await consult()).statusCode).toBe(403);
    expect((await complete()).statusCode).toBe(403);
  });

  test("should record a consultation once when the request is repeated", async () => {
    const first = await consult();
    expect(first.statusCode).toBe(201);
    expect(first.body.data).toMatchObject({
      learner: fixture.learner.id, resource: fixture.resource.id, consulted: true,
    });
    expect(first.body.data.consultedAt).toBeTruthy();
    const second = await consult();
    expect(second.statusCode).toBe(200);
    expect(second.body.data._id).toBe(first.body.data._id);
    expect(await ResourceProgress.countDocuments({ learner: fixture.learner._id })).toBe(1);
  });

  test("should reject module completion until all resources are consulted", async () => {
    expect((await complete()).statusCode).toBe(400);
    expect(await ModuleProgress.countDocuments({ learner: fixture.learner._id })).toBe(0);
  });

  test("should not count another user's consultation for this learner", async () => {
    await ResourceProgress.create({
      learner: fixture.course.trainer, resource: fixture.resource._id, consulted: true,
    });
    expect((await complete()).statusCode).toBe(400);
  });

  test("should complete a module after consultation without duplicate progress", async () => {
    expect((await consult()).statusCode).toBe(201);
    const first = await complete();
    expect(first.statusCode).toBe(200);
    expect(first.body.data).toMatchObject({
      learner: fixture.learner.id, module: fixture.modules[0].id, status: "completed",
    });
    expect(first.body.data.completedAt).toBeTruthy();
    const second = await complete();
    expect(second.statusCode).toBe(200);
    expect(second.body.data._id).toBe(first.body.data._id);
    expect(await ModuleProgress.countDocuments({ learner: fixture.learner._id })).toBe(1);
  });

  test("should unlock the next module after completing the previous module", async () => {
    expect((await complete(1)).statusCode).toBe(403);
    expect((await consult()).statusCode).toBe(201);
    expect((await complete()).statusCode).toBe(200);
    expect((await complete(1)).statusCode).toBe(200);
    expect(await ModuleProgress.countDocuments({
      learner: fixture.learner._id, status: "completed",
    })).toBe(2);
  });

  test("should return 404 for missing resources and modules", async () => {
    const missingId = new mongoose.Types.ObjectId();
    for (const action of ["consult", "complete"]) {
      const response = await request(app).post(`/api/modules/${missingId}/${action}`)
        .set("Authorization", `Bearer ${fixture.token}`);
      expect(response.statusCode).toBe(404);
    }
  });
});
