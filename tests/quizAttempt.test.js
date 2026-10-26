const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const { submitQuizAttempt } = require("../services/quizAttemptService");
const { useTestAccounts } = require("./helpers/accounts");
const { createLearningFixture } = require("./helpers/learning");
const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");

describe("QuizAttempt persistence", () => {
  let fixture;
  let quiz;

  afterEach(async () => {
    if (mongoose.connection.name !== "lms_test" || !fixture) return;

    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await Quiz.deleteOne({ _id: quiz._id });
    fixture = undefined;
    quiz = undefined;
  });

  useTestAccounts();

  beforeEach(async () => {
    fixture = await createLearningFixture();

    quiz = await Quiz.create({
      moduleId: fixture.modules[0]._id,
      title: "Test quiz",
      passingScore: 60,
      questions: [
        {
          id: "q1",
          text: "Test question",
          choices: [
            { id: "a", text: "Answer A" },
            { id: "b", text: "Answer B" },
          ],
          correctChoiceId: "a",
        },
      ],
    });
  });

  test("saves an attempt linked to the learner and quiz", async () => {
    const savedAttempt = await QuizAttempt.create({
      learner: fixture.learner._id,
      quiz: quiz._id,
      correctCount: 1,
      totalQuestions: 1,
      scorePercent: 100,
      passed: true,
    });

    const foundAttempt = await QuizAttempt.findById(savedAttempt._id);

    expect(foundAttempt.learner.toString()).toBe(fixture.learner._id.toString());
    expect(foundAttempt.quiz.toString()).toBe(quiz._id.toString());
    expect(foundAttempt.scorePercent).toBe(100);
    expect(foundAttempt.passed).toBe(true);
    expect(foundAttempt.createdAt).toBeInstanceOf(Date);
  });

  test("calculates the score from answers and saves the attempt", async () => {
    const attempt = await submitQuizAttempt({
      quizId: quiz._id,
      learnerId: fixture.learner._id,
      answers: [{ questionId: "q1", choiceId: "a" }],
    });

    expect(attempt.correctCount).toBe(1);
    expect(attempt.totalQuestions).toBe(1);
    expect(attempt.scorePercent).toBe(100);
    expect(attempt.passed).toBe(true);
  });

  test("submits answers and saves the calculated attempt", async () => {
    const response = await request(app)
      .post(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`)
      .send({
        answers: [{ questionId: "q1", choiceId: "a" }],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data).toMatchObject({
      learner: fixture.learner._id.toString(),
      quiz: quiz._id.toString(),
      correctCount: 1,
      totalQuestions: 1,
      scorePercent: 100,
      passed: true,
    });

    const savedAttempt = await QuizAttempt.findById(response.body.data._id);

    expect(savedAttempt).not.toBeNull();
  });

  test("saves a failed attempt when the score is below the passing threshold", async () => {
    const response = await request(app)
      .post(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`)
      .send({
        answers: [{ questionId: "q1", choiceId: "b" }],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data).toMatchObject({
      answers: [{ questionId: "q1", choiceId: "b" }],
      correctCount: 0,
      totalQuestions: 1,
      scorePercent: 0,
      passed: false,
    });

    const savedAttempt = await QuizAttempt.findById(response.body.data._id);

    expect(savedAttempt).not.toBeNull();
    expect(savedAttempt.passed).toBe(false);
    expect(savedAttempt.answers[0]).toMatchObject({
      questionId: "q1",
      choiceId: "b",
    });
  });

  test("rejects a client-supplied score", async () => {
    const response = await request(app)
      .post(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`)
      .send({
        answers: [{ questionId: "q1", choiceId: "b" }],
        scorePercent: 100,
        passed: true,
      });

    expect(response.statusCode).toBe(400);
    expect(await QuizAttempt.countDocuments({ quiz: quiz._id })).toBe(0);
  });

  test("returns only the authenticated learner's attempts", async () => {
    await QuizAttempt.create([
      {
        learner: fixture.learner._id,
        quiz: quiz._id,
        correctCount: 1,
        totalQuestions: 1,
        scorePercent: 100,
        passed: true,
      },
      {
        learner: fixture.course.trainer,
        quiz: quiz._id,
        correctCount: 0,
        totalQuestions: 1,
        scorePercent: 0,
        passed: false,
      },
    ]);

    const response = await request(app)
      .get(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${fixture.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].learner).toBe(fixture.learner._id.toString());
  });

  test("allows the course trainer to view learner attempts", async () => {
    await QuizAttempt.create({
      learner: fixture.learner._id,
      quiz: quiz._id,
      correctCount: 1,
      totalQuestions: 1,
      scorePercent: 100,
      passed: true,
    });

    const trainerToken = jwt.sign(
      { role: "trainer" },
      process.env.JWT_SECRET,
      {
        subject: fixture.course.trainer.toString(),
        expiresIn: "5m",
      },
    );

    const response = await request(app)
      .get(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${trainerToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].learner).toBe(fixture.learner._id.toString());
  });

  test("rejects another trainer from viewing learner attempts", async () => {
    await QuizAttempt.create({
      learner: fixture.learner._id,
      quiz: quiz._id,
      correctCount: 1,
      totalQuestions: 1,
      scorePercent: 100,
      passed: true,
    });

    const otherTrainerId = new mongoose.Types.ObjectId();

    const otherTrainerToken = jwt.sign(
      { role: "trainer" },
      process.env.JWT_SECRET,
      {
        subject: otherTrainerId.toString(),
        expiresIn: "5m",
      },
    );

    const response = await request(app)
      .get(`/api/quizzes/${quiz._id}/attempts`)
      .set("Authorization", `Bearer ${otherTrainerToken}`);

    expect(response.statusCode).toBe(403);
  });

  test("rejects unauthenticated attempt history requests", async () => {
    const response = await request(app)
      .get(`/api/quizzes/${quiz._id}/attempts`);

    expect(response.statusCode).toBe(401);
  });
});