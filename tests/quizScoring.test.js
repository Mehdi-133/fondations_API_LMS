const { privateQuiz, submission} = require("./quizData")
const { calculateQuizScore } = require("../services/quizScoringService")

test("calculating the score of quiz", () => {
    const result = calculateQuizScore(privateQuiz, submission.answers)

    expect(result).toEqual({
        correctCount: 2,
        totalQuestions: 3,
        scorePercent: 66.67,
        passed: true
    })
}) 