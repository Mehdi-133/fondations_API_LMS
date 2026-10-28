const Course = require("../models/Course")
const JobExecution = require("../models/JobExecution")

const getTrainerStats = async (trainerId) => {
    const courses = await Course.find({ trainer: trainerId }).select("_id title").lean()
    
    const latestRefresh = await JobExecution.findOne({
        jobName: "statsRefresh",
        status: "success"
    }).sort({finishedAt: -1}).lean()
    
    if(!latestRefresh) {
        return {
            dataAvailable: false,
            refreshedAt: null,
            courses: []
        }
    }

    const result = latestRefresh.result || {}

    const enrollmentsByCourse = new Map(
        (result.enrollmentsPerCourse || []).map((item) => [
            String(item._id),
            item.totalEnrollments
        ])
    )

    const ProgressByCourse = new Map(
        (result.progressPerCourse || []).map((item) => [
            String(item._id),
            item.averageProgress
        ])
    )

    return {
        dataAvailable: true,
        refreshedAt: latestRefresh.finishedAt,
        courses: courses.map((course) => {
            const courseId = String(course._id)
            const averageProgress = Number(
                (ProgressByCourse.get(courseId) || 0).toFixed(2)
            )

            return {
                courseId,
                courseTitle: course.title,
                totalEnrollments: enrollmentsByCourse.get(courseId) || 0,
                averageProgress
            }
        })
    }
}

module.exports = { getTrainerStats }