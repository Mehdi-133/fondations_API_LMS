const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err.name === "ValidationError") {
        return res.status(400).json({
            status: 400,
            message: "Validation error",
            errors: err.errors
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            status: 400,
            message: "Invalid ID"
        });
    }

    res.status(500).json({
        status: 500,
        message: "Internal server error"
    });
};

module.exports = errorHandler;