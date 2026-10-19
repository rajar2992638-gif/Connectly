require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const reelRoutes = require("./routes/reelRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/reels", reelRoutes);

connectDB();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Social Media Backend Server is Running!");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});