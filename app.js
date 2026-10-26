const express = require("express");

const courseRoutes = require("./routes/courseRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const authRoutes = require("./routes/authRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const trainerProgressRoutes = require("./routes/trainerProgressRoutes");
const trainerSummaryPreferenceRoutes = require("./routes/trainerSummaryPreferenceRoutes");
const notificationConfigRoutes = require("./routes/notificationConfigRoutes");
const quizRoutes = require("./routes/quizRoutes");
const jobRoutes = require("./routes/jobRoutes");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "LMS API is working",
  });
});

app.use("/api/config", notificationConfigRoutes);
app.use("/api/courses", courseRoutes);

app.get("/api/modules/test", (req, res) => {
  res.json({
    message: "modules route works",
  });
});

app.use("/api/modules", resourceRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/trainer", trainerProgressRoutes);
app.use("/api/trainer/summary-preferences", trainerSummaryPreferenceRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin/jobs", jobRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
