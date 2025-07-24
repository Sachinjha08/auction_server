function formatCurrency(amount) {
  return '$' + Number(amount).toFixed(2);
}

function isAuctionEnded(auction) {
  return new Date(auction.endTime) < new Date() || auction.status === 'ended';
}

module.exports = { formatCurrency, isAuctionEnded }; 