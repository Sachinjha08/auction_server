let io;

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinAuction', (auctionId) => {
      socket.join(auctionId);
    });

    socket.on('leaveAuction', (auctionId) => {
      socket.leave(auctionId);
    });

    socket.on('newBid', (data) => {
      // data: { auctionId, bid }
      io.to(data.auctionId).emit('bidUpdate', data.bid);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { initSocket, getIO }; 