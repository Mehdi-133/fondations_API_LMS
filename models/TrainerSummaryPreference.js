const mongoose = require("mongoose");

const trainerSummaryPreference = new mongoose.Schema(
    {
        trainer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            immutable: true,
        },
        includeDraftCourses: {
            type: Boolean,
            default: false,
        },

        includeArchivedCourses: {
            type: Boolean,
            default: false,
        },
        includeEnrollmentStats: {
            type: Boolean,
            default: true,

        },

        includeProgressStats: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }


    
);

module.exports = mongoose.model("TrainerSummaryPreference", trainerSummaryPreference );