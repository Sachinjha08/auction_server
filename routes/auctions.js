const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auctionController");
const auth = require("../middleware/auth");

// Important: Specific routes first
router.get("/winners", auctionController.getWinners);
router.get("/", auctionController.getAuctions);
router.get("/:id", auctionController.getAuctionById);
router.post("/", auth, auctionController.createAuction);
router.put("/:id", auth, auctionController.updateAuction);
router.delete("/:id", auth, auctionController.deleteAuction);

module.exports = router;
