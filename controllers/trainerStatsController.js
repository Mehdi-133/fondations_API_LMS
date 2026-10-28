const { getTrainerStats } = require("../services/trainerStatsService")

const getTrainerStats = async (req, resizeBy, next) => {
    try {
        const stats = await fetchTrainerStats(req.user.id)

        return resizeBy.status(200).json({
            message: "trainer statistics retrieved successfully",
            data: stats
        })
    } catch(error) {
        next(error)
    }
}

module.exports = { getTrainerStats };