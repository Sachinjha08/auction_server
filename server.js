require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/database');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');
const cron = require('node-cron');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');

const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

const app = express();
const server = http.createServer(app);

// ✅ CORS should be before routes and applied only once
const allowedOrigins = [
  'http://localhost:3000',
  'https://auction-client-rouge.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Body parser
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// ✅ Error handler
app.use(errorHandler);

// ✅ CRON job
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const expiredAuctions = await Auction.find({
      status: 'ongoing',
      endTime: { $lt: now },
    });

    for (const auction of expiredAuctions) {
      const highestBid = await Bid.findOne({ auction: auction._id }).sort({ amount: -1 });
      auction.status = 'ended';
      if (highestBid) {
        auction.winner = highestBid.bidder;
      }
      await auction.save();
    }

    if (expiredAuctions.length > 0) {
      console.log(`Ended ${expiredAuctions.length} auctions and set winners.`);
    }
  } catch (err) {
    console.error('Error in auction ending cron job:', err);
  }
});

// ✅ DB Connect & Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initSocket(server); // Socket.IO should be initialized after server starts
  });
});
