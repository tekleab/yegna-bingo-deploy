const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUser,
  getBalance,
  getTransactions,
  updateBalance
} = require('../controllers/userController');

// User registration
router.post('/register', registerUser);

// Get user by Telegram ID
router.get('/:telegramId', getUser);

// Get user balance
router.get('/:telegramId/balance', getBalance);

// Get user transactions
router.get('/:telegramId/transactions', getTransactions);

// Update user balance
router.put('/:telegramId/balance', updateBalance);

module.exports = router; 