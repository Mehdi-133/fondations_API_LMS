
const connectDB = require("./config/db");
const app = require("./app");
require("dotenv").config();

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});