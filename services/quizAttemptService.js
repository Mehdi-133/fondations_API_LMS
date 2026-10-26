const Quiz = require("../models/Quiz")
const QuizAttempt = require("../models/QuizAttempt")
const { calculateQuizScore } = require("./quizScoringService")

const submitQuizAttempt = async ({ quizId, learnerId, answers}) => {
    if(!Array.isArray(answers)) {
        const error = new Error("answers must be an array")
        error.statusCode = 400
        throw error
    }

    const quiz = await Quiz.findById(quizId)

    if(!quiz) {
        const error = new Error("Quiz not found")
        error.statusCode = 404
        throw error
    }

    const score = calculateQuizScore(quiz, answers)

    const attempt = await QuizAttempt.create({
        learner: learnerId,
        quiz: quiz._id,
        ...score
    })

    return attempt
}

module.exports = { submitQuizAttempt }