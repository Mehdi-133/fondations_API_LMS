const { submitQuizAttempt: createQuizAttempt } = require("../services/quizAttemptService")

const submitQuizAttempt = async(req, res, next) => {
    try {
        const attempt = await createQuizAttempt({
            quizId: req.params.quizId,
            learnerId: req.user.id,
            answers: req.body.answers
        })

        res.status(201).json({
            status: 201,
            message: "quiz attempt submitted successfully",
            data: attempt
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { submitQuizAttempt }