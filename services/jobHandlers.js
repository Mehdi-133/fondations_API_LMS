const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const {
  getPreferences,
} = require("./trainerSummaryPreferenceService");

const jobHandlers = {
  inactiveLearnerReminder: async () => {
    console.log("[JOB] inactiveLearnerReminder executed");

    return {
      message: "Handler executed; reminder logic pending",
    };
  },

  trainerSummary: async () => {
    console.log("[JOB] trainerSummary executed");

    const trainers = await User.find({
      role: "trainer",
      status: "active",
    }).select("_id name email");

    const summaries = [];

    for (const trainer of trainers) {
      const preferences = await getPreferences(trainer._id);

      const courseFilter = {
        trainer: trainer._id,
      };

      const excludedStatuses = [];

      if (!preferences.includeDraftCourses) {
        excludedStatuses.push("draft");
      }

      if (!preferences.includeArchivedCourses) {
        excludedStatuses.push("archived");
      }

      if (excludedStatuses.length > 0) {
        courseFilter.status = {
          $nin: excludedStatuses,
        };
      }

      const courses = await Course.find(courseFilter)
        .select("_id title status");

      const courseIds = courses.map((course) => course._id);

      const summary = {
        trainerId: trainer._id,
        trainerName: trainer.name,
        trainerEmail: trainer.email,
        courses: courses.map((course) => ({
          id: course._id,
          title: course.title,
          status: course.status,
        })),
      };

      if (
        preferences.includeEnrollmentStats &&
        courseIds.length > 0
      ) {
        const enrollmentStats = await Enrollment.aggregate([
          {
            $match: {
              course: { $in: courseIds },
            },
          },
          {
            $group: {
              _id: "$course",
              totalEnrollments: { $sum: 1 },
            },
          },
        ]);

        summary.enrollmentStats = enrollmentStats;
      }

      if (
        preferences.includeProgressStats &&
        courseIds.length > 0
      ) {
        const progressStats = await Enrollment.aggregate([
          {
            $match: {
              course: { $in: courseIds },
            },
          },
          {
            $group: {
              _id: "$course",
              averageProgress: { $avg: "$progress" },
            },
          },
        ]);

        summary.progressStats = progressStats;
      }

      summaries.push(summary);
    }

    console.log(
      `[JOB] trainerSummary completed for ${summaries.length} trainers`
    );

    return {
      message: "Trainer summaries generated successfully",
      count: summaries.length,
      summaries,
    };
  },

  statsRefresh: async () => {
    console.log("[JOB] statsRefresh executed");

    return {
      message: "Handler executed; statistics logic pending",
    };
  },
};

module.exports = jobHandlers;
