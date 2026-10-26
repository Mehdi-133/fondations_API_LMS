const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const { submitQuizAttempt } = require("../services/quizAttemptService");
const { useTestAccounts } = require("./helpers/accounts");
const { createLearningFixture } = require("./helpers/learning");

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
      questions: [{
        id: "q1",
        text: "Test question",
        choices: [
          { id: "a", text: "Answer A" },
          { id: "b", text: "Answer B" },
        ],
        correctChoiceId: "a",
      }],
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
});