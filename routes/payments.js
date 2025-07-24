const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/:auctionId', auth, paymentController.createPayment);
router.get('/:auctionId', auth, paymentController.getPaymentStatus);

module.exports = router; 