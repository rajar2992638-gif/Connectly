const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    videoUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reel", reelSchema);