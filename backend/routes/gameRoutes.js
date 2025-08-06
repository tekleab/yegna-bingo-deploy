const express = require('express');
const router = express.Router();
const {
  createGame,
  joinGame,
  getGameStatus,
  markNumber,
  callNextNumber,
  selectCard,
  claimBingo
} = require('../controllers/gameController');

// Create new game
router.post('/create', createGame);

// Join existing game
router.post('/join', joinGame);

// Get game status
router.get('/:gameId/status', getGameStatus);

// Mark number on player's card
router.post('/:gameId/mark', markNumber);

// Call next number (for auto-calling)
router.post('/:gameId/call', callNextNumber);

// Select card (for card selection mode)
router.post('/:gameId/select-card', selectCard);

// Claim bingo
router.post('/:gameId/bingo', claimBingo);

module.exports = router; 