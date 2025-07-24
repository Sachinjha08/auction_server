const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    images: [String],
    startingPrice: Number,
    currentPrice: Number,
    endTime: Date,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
    status: {
      type: String,
      enum: ["ongoing", "ended", "active", "cancelled", "sold"],
      default: "ongoing",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);
