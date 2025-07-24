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

// Import routes
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Error handler
app.use(errorHandler);

// Schedule a job to end expired auctions and set the winner every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    // Find all ongoing auctions whose endTime has passed
    const expiredAuctions = await Auction.find({ status: 'ongoing', endTime: { $lt: now } });
    for (const auction of expiredAuctions) {
      // Find the highest bid for this auction
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

// Connect to DB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initSocket(server);
  });
}); 