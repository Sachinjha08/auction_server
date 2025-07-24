const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/dashboard', auth, userController.getUserDashboard);
router.get('/', auth, userController.getAllUsers);
router.post('/wallet/add', auth, userController.addMoneyToWallet);
router.post('/wallet/transfer', auth, userController.transferMoney);
router.post('/wallet/withdraw', auth, userController.withdrawMoneyFromWallet);
router.get('/wallet', auth, userController.getWallet);
router.get('/wallet/transactions', auth, userController.getWalletTransactions);
router.get('/:id/wallet/transactions', auth, userController.getUserWalletTransactions);
router.put('/profile', auth, userController.updateProfile);
router.delete('/:id', auth, admin, userController.deleteUser);

module.exports = router; 