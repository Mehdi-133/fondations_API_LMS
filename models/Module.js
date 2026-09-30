const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

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

        order: {
            type: Number,
            required: true,
            min: 1
        },

        estimatedDuration: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        timestamps: true
    }
);

// L'ordre doit être unique pour un même cours
moduleSchema.index(
    { course: 1, order: 1 },
    { unique: true }
);

module.exports = mongoose.model("Module", moduleSchema);