const express = require("express");
const Reel = require("../models/Reel");

const router = express.Router();

// Get all reels
router.get("/", async (req, res) => {
  try {
    const reels = await Reel.find().sort({ createdAt: -1 });

    res.json(reels);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reels",
      error: error.message,
    });
  }
});

module.exports = router;