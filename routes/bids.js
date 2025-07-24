const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const auth = require('../middleware/auth');

router.post('/:auctionId', auth, bidController.placeBid);
router.get('/:auctionId', bidController.getBidsForAuction);

module.exports = router; 