const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const { getIO } = require('../config/socket');

exports.placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'active') return res.status(400).json({ message: 'Auction is not active' });
    if (amount <= auction.currentPrice) return res.status(400).json({ message: 'Bid must be higher than current price' });
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance to place bid' });
    }
    user.wallet.balance -= amount;
    user.wallet.transactions.push({ type: 'auction', amount, description: `Placed bid on auction: ${auction.title}` });
    await user.save();
    const bid = new Bid({ auction: auction._id, bidder: req.user.userId, amount });
    await bid.save();
    auction.currentPrice = amount;
    auction.bids.push(bid._id);
    await auction.save();
    // Real-time update
    getIO().to(auction._id.toString()).emit('bidUpdate', { auctionId: auction._id, bid });
    res.status(201).json(bid);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBidsForAuction = async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId }).populate('bidder', 'username').sort({ createdAt: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 