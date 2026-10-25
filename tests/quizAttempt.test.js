const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const { useTestAccounts } = require("./helpers/accounts");
const { createLearningFixture } = require("./helpers/learning");

describe("QuizAttempt model", () => {
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
      title: "Quiz dyal test",
      passingScore: 60,
      questions: [{
        id: "q1",
        text: "So2al test",
        choices: [
          { id: "a", text: "Jawab A" },
          { id: "b", text: "Jawab B" },
        ],
        correctChoiceId: "a",
      }],
    });
  });

  test("kay7fed tentative mربوطة b learner w quiz", async () => {
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
});