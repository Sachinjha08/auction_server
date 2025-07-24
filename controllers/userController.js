const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    const auctions = await Auction.find({ seller: userId });
    const bids = await Bid.find({ bidder: userId }).populate('auction', 'title');
    res.json({ user, auctions, bids });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addMoneyToWallet = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    const user = await User.findById(userId);
    user.wallet.balance += amount;
    user.wallet.transactions.push({ type: 'add', amount, description: 'Added to wallet' });
    await user.save();
    res.json({ balance: user.wallet.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.transferMoney = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { recipientId, amount } = req.body;
    if (!recipientId || !amount || amount <= 0) return res.status(400).json({ message: 'Invalid data' });
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });
    if (sender.wallet.balance < amount) return res.status(400).json({ message: 'Insufficient funds' });
    sender.wallet.balance -= amount;
    sender.wallet.transactions.push({ type: 'send', amount, description: `Sent to ${recipient.username}` });
    recipient.wallet.balance += amount;
    recipient.wallet.transactions.push({ type: 'receive', amount, description: `Received from ${sender.username}` });
    await sender.save();
    await recipient.save();
    res.json({ balance: sender.wallet.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.withdrawMoneyFromWallet = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
    const user = await User.findById(userId);
    if (user.wallet.balance < amount) return res.status(400).json({ message: 'Insufficient wallet balance' });
    user.wallet.balance -= amount;
    user.wallet.transactions.push({ type: 'withdraw', amount, description: 'Withdrawn from wallet' });
    await user.save();
    res.json({ balance: user.wallet.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    res.json({ balance: user.wallet.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    res.json({ transactions: user.wallet.transactions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserWalletTransactions = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ transactions: user.wallet.transactions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateFields = {};
    // Only allow updating certain fields
    const allowedFields = [
      'username', 'email', 'mobile', 'address', 'upiId', 'bankAccountNumber', 'ifscCode',
      'profile.avatar', 'profile.bio'
    ];
    for (const field of allowedFields) {
      if (field.includes('.')) {
        // Nested field (profile.avatar, profile.bio)
        const [parent, child] = field.split('.');
        if (req.body[parent] && req.body[parent][child] !== undefined) {
          if (!updateFields[parent]) updateFields[parent] = {};
          updateFields[parent][child] = req.body[parent][child];
        }
      } else if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    }
    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 