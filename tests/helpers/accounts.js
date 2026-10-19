const { randomUUID } = require("crypto");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Course = require("../../models/Course");

const domain = `${randomUUID()}.example.test`;
const learnerEmail = `learner@${domain}`;
const trainerEmail = `trainer@${domain}`;

const useTestAccounts = () => {
  beforeEach(async () => {
    if (mongoose.connection.name !== "lms_test") {
      throw new Error("Test accounts require the lms_test database");
    }

    const password = await bcrypt.hash("Password123", 10);
    await User.create([
      { name: "Test Learner", email: learnerEmail, password, role: "learner" },
      { name: "Test Trainer", email: trainerEmail, password, role: "trainer" },
    ]);
  });

  afterEach(async () => {
    if (mongoose.connection.name !== "lms_test") return;

    const users = await User.find({
      email: { $regex: `@${domain.replace(/\./g, "\\.")}$` },
    }).select("_id");
    const ids = users.map(user => user._id);
    await Course.deleteMany({ trainer: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
  });
};

module.exports = { useTestAccounts, learnerEmail, trainerEmail, domain };
