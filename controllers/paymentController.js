const Payment = require('../models/Payment');
const Auction = require('../models/Auction');
const paypal = require('@paypal/checkout-server-sdk');
const { clientId, secret } = require('../config/paypal');

const environment = new paypal.core.SandboxEnvironment(clientId, secret);
const client = new paypal.core.PayPalHttpClient(environment);

exports.createPayment = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'ended') return res.status(400).json({ message: 'Auction not ended yet' });
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value: auction.currentPrice.toString() }
      }]
    });
    const order = await client.execute(request);
    const payment = new Payment({
      auction: auction._id,
      payer: req.user.userId,
      amount: auction.currentPrice,
      paymentId: order.result.id,
      status: 'pending'
    });
    await payment.save();
    res.json({ id: order.result.id, status: 'pending', links: order.result.links });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ auction: req.params.auctionId, payer: req.user.userId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ status: payment.status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 