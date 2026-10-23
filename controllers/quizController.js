const Quiz = require("../models/Quiz");
const Module = require("../models/Module");
const Course = require("../models/Course");

const createQuiz = async (req, res, next) => {
  try {
    const module = await Module.findById(req.body.moduleId);
    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      return next(error);
    }

    const course = await Course.findById(module.course);
    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      return next(error);
    }

    if (course.trainer.toString() !== req.user.id) {
      const error = new Error(
        "You are not authorized to create a quiz for this course",
      );
      error.statusCode = 403;
      return next(error);
    }

    const quiz = await Quiz.create(req.body);
    res.status(201).json({
      status: 201,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      const error = new Error("Quiz not found");
      error.statusCode = 404;
      return next(error);
    }

    const module = await Module.findById(quiz.moduleId);
    if (!module) {
      const error = new Error("Module not found");
      error.statusCode = 404;
      return next(error);
    }

    const course = await Course.findById(module.course);
    if (!course) {
      const error = new Error("Course not found");
      error.statusCode = 404;
      return next(error);
    }

    if (course.trainer.toString() !== req.user.id) {
      const error = new Error("You are not authorized to update this quiz");
      error.statusCode = 403;
      return next(error);
    }

    const { title, questions, passingScore, isActive, isRequired } = req.body;

    if (title !== undefined) {
      quiz.title = title;
    }
    if (questions !== undefined) {
      quiz.questions = questions;
    }
    if (passingScore !== undefined) {
      quiz.passingScore = passingScore;
    }
    if (isActive !== undefined) {
      quiz.isActive = isActive;
    }
    if (isRequired !== undefined) {
      quiz.isRequired = isRequired;
    }

    await quiz.save();
    res.status(200).json({
      status: 200,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  updateQuiz,
};
