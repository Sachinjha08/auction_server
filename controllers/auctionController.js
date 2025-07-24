const Auction = require("../models/Auction");
const Bid = require("../models/Bid");

exports.getAuctions = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (status) query.status = status;

    const auctions = await Auction.find(query)
      .populate("seller", "username")
      .sort({ endTime: -1 });

    res.json(auctions);
  } catch (err) {
    console.error("Error in getAuctions:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("seller", "username")
      .populate({
        path: "bids",
        populate: { path: "bidder", select: "username" },
      });

    if (!auction) return res.status(404).json({ message: "Auction not found" });
    res.json(auction);
  } catch (err) {
    console.error("Error in getAuctionById:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createAuction = async (req, res) => {
  try {
    const { title, description, startingPrice, endTime, images } = req.body;
    const User = require("../models/User");
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wallet.balance < startingPrice) {
      return res
        .status(400)
        .json({ message: "Insufficient wallet balance to create auction" });
    }

    user.wallet.balance -= startingPrice;
    user.wallet.transactions.push({
      type: "auction",
      amount: startingPrice,
      description: `Created auction: ${title}`,
    });
    await user.save();

    const auction = new Auction({
      title,
      description,
      images,
      startingPrice,
      currentPrice: startingPrice,
      endTime,
      seller: req.user.userId,
      status: "ongoing",
      winner: null,
    });

    await auction.save();
    res.status(201).json(auction);
  } catch (err) {
    console.error("Error in createAuction:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (
      auction.seller.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ✅ Validate status field
    const allowedStatuses = ["ongoing", "ended"];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    Object.assign(auction, req.body);
    await auction.save();
    res.json(auction);
  } catch (err) {
    console.error("Error in updateAuction:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (
      auction.seller.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await auction.remove();
    res.json({ message: "Auction deleted" });
  } catch (err) {
    console.error("Error in deleteAuction:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWinners = async (req, res) => {
  console.log("getWinners endpoint called");
  try {
    const auctions = await Auction.find({
      status: "ended",
      winner: { $ne: null },
    })
      .populate("winner", "username email")
      .populate("seller", "username");

    const winners = auctions.map((a) => ({
      auctionId: a._id,
      auctionTitle: a.title,
      winner: a.winner
        ? { username: a.winner.username, email: a.winner.email }
        : null,
      finalPrice: a.currentPrice,
      endTime: a.endTime,
    }));

    res.json(winners);
  } catch (err) {
    console.error("getWinners error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
