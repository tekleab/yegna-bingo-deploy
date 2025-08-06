const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished', 'cancelled'],
    default: 'waiting'
  },
  betAmount: {
    type: Number,
    required: true,
    min: 10,
    max: 1000
  },
  maxPlayers: {
    type: Number,
    default: 4
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    telegramId: String,
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    bingoCard: [[Number]], // 5x5 Bingo card
    markedNumbers: [Number],
    hasWon: {
      type: Boolean,
      default: false
    }
  }],
  calledNumbers: [{
    number: Number,
    calledAt: {
      type: Date,
      default: Date.now
    }
  }],
  winner: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    telegramId: String,
    username: String,
    wonAt: Date
  },
  potAmount: {
    type: Number,
    default: 0
  },
  startedAt: Date,
  endedAt: Date,
  autoCallInterval: {
    type: Number,
    default: 3000 // 3 seconds
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
gameSchema.index({ status: 1 });
gameSchema.index({ 'players.telegramId': 1 });

module.exports = mongoose.model('Game', gameSchema); 