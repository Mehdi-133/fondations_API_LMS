
const express = require("express");

const courseRoutes = require("./routes/courseRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const authRoutes = require("./routes/authRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const trainerProgressRoutes = require("./routes/trainerProgressRoutes");
const notificationConfigRoutes = require("./routes/notificationConfigRoutes");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "LMS API is working"
    });
});

app.use("/api/config", notificationConfigRoutes);
app.use("/api/courses", courseRoutes);

app.get("/api/modules/test", (req, res) => {
    res.json({
        message: "modules route works"
    });
});

app.use("/api/modules", resourceRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/trainer", trainerProgressRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

module.exports = app;