const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }],
  auctions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auction' }],
  profile: {
    avatar: { type: String },
    bio: { type: String }
  },
  mobile: { type: String },
  address: { type: String },
  upiId: { type: String },
  bankAccountNumber: { type: String },
  ifscCode: { type: String },
  wallet: {
    balance: { type: Number, default: 0 },
    transactions: [
      {
        type: {
          type: String,
          enum: ['add', 'receive', 'send', 'auction', 'withdraw'],
          required: true
        },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        description: { type: String }
      }
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 