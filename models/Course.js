const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        objectives: {
            type: [String],
            default: []
        },

        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            required: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        estimatedDuration: {
            type: Number,
            required: true,
            min: 1
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        },

        publishedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Course", courseSchema);