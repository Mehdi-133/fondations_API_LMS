const errorHandler = (err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      status: 413,
      message: "File must not exceed 5 MB",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: 400,
      message: "Validation error",
      errors: err.errors,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      status: 400,
      message: "Invalid ID",
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];

    let message = `${field} already exists`;

    if (field === "email") {
      message = "Email already registered";
    }

    return res.status(409).json({
      status: 409,
      message,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: 401,
      message: "Token has expired",
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
    return res.status(401).json({
      status: 401,
      message: "Invalid token",
    });
  }

  if (err.statusCode) {
    if (err.statusCode >= 500) {
      console.error(err);
    }

    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  }

  console.error(err);

  res.status(500).json({
    status: 500,
    message: err.message
  });
};

module.exports = errorHandler;
