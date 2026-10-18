require("dotenv").config({ quiet: true });

const connectDB = require("../config/db");
const mongoose = require("mongoose");

beforeAll(async () => {
    await connectDB();
});

afterAll(async () => {
    await mongoose.connection.close();
});