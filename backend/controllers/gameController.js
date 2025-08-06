const { localDB } = require('../config/local-database');

// Generate Bingo card numbers
const generateBingoCard = () => {
  const card = [];
  const ranges = [
    [1, 15],   // B
    [16, 30],  // I
    [31, 45],  // N
    [46, 60],  // G
    [61, 75],  // O
  ];

  for (let col = 0; col < 5; col++) {
    const nums = [];
    for (let i = ranges[col][0]; i <= ranges[col][1]; i++) {
      nums.push(i);
    }
    // Shuffle and take first 5
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    for (let row = 0; row < 5; row++) {
      if (!card[row]) card[row] = [];
      card[row][col] = nums[row];
    }
  }
  
  // Set center as free
  card[2][2] = 'FREE';
  return card;
};

// Check for Bingo win (1-90 grid)
const checkBingoWin = (card, markedNumbers) => {
  // For 1-90 grid, check for bingo patterns
  // A player wins when they have 5 marked numbers in a row, column, or diagonal
  
  if (!card || !markedNumbers || markedNumbers.length < 5) {
    return false;
  }

  // Create a 9x10 grid (90 numbers)
  const grid = [];
  for (let row = 0; row < 9; row++) {
    grid[row] = [];
    for (let col = 0; col < 10; col++) {
      const number = row * 10 + col + 1;
      if (number <= 90) {
        grid[row][col] = markedNumbers.includes(number);
      }
    }
  }

  // Check rows
  for (let row = 0; row < 9; row++) {
    let count = 0;
    for (let col = 0; col < 10; col++) {
      if (grid[row][col]) count++;
    }
    if (count >= 5) return true;
  }

  // Check columns
  for (let col = 0; col < 10; col++) {
    let count = 0;
    for (let row = 0; row < 9; row++) {
      if (grid[row][col]) count++;
    }
    if (count >= 5) return true;
  }

  // Check diagonals (main diagonal)
  let count = 0;
  for (let i = 0; i < Math.min(9, 10); i++) {
    if (grid[i][i]) count++;
  }
  if (count >= 5) return true;

  // Check reverse diagonal
  count = 0;
  for (let i = 0; i < Math.min(9, 10); i++) {
    if (grid[i][9-i]) count++;
  }
  if (count >= 5) return true;

  return false;
};

// Select card for card selection mode
const selectCard = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { telegramId, cardNumber } = req.body;

    const game = await localDB.findGame(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (!game.cardSelectionMode) {
      return res.status(400).json({
        success: false,
        message: 'Card selection mode is not active'
      });
    }

    if (game.currentPlayerTurn !== telegramId) {
      return res.status(400).json({
        success: false,
        message: 'Not your turn to select cards'
      });
    }

    const player = game.players.find(p => p.telegramId === telegramId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found in game'
      });
    }

    // Check if card is already selected by someone
    const isCardUsed = Object.values(game.playerSelectedCards || {}).some(cards => 
      cards.includes(cardNumber)
    );

    if (isCardUsed) {
      return res.status(400).json({
        success: false,
        message: 'Card is already selected by another player'
      });
    }

    // Check if player has already selected 15 cards
    if (player.selectedCards && player.selectedCards.length >= 15) {
      return res.status(400).json({
        success: false,
        message: 'You have already selected 15 cards'
      });
    }

    // Add card to player's selection
    if (!player.selectedCards) {
      player.selectedCards = [];
    }
    player.selectedCards.push(cardNumber);

    // Update player selected cards in game
    if (!game.playerSelectedCards) {
      game.playerSelectedCards = {};
    }
    if (!game.playerSelectedCards[telegramId]) {
      game.playerSelectedCards[telegramId] = [];
    }
    game.playerSelectedCards[telegramId].push(cardNumber);

    // Check if player has selected 15 cards
    if (player.selectedCards.length >= 15) {
      // Move to next player
      const currentPlayerIndex = game.players.findIndex(p => p.telegramId === telegramId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
      game.currentPlayerTurn = game.players[nextPlayerIndex].telegramId;

      // Check if all players have selected their cards
      const allPlayersSelected = game.players.every(p => 
        p.selectedCards && p.selectedCards.length >= 15
      );

      if (allPlayersSelected) {
        // Start the bingo game
        game.cardSelectionMode = false;
        game.status = 'playing';
        game.gameStarted = true;
        game.startedAt = new Date().toISOString();

        // Set each player's bingo card to their selected cards
        game.players.forEach(p => {
          p.bingoCard = p.selectedCards;
          p.markedNumbers = ['FREE']; // Start with free space
        });

        // Start auto-calling
        startAutoCalling(gameId);
      }
    }

    await localDB.updateGame(gameId, game);

    res.json({
      success: true,
      message: 'Card selected successfully',
      data: {
        selectedCards: player.selectedCards,
        currentPlayerTurn: game.currentPlayerTurn,
        cardSelectionMode: game.cardSelectionMode
      }
    });

  } catch (error) {
    console.error('Select card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while selecting card'
    });
  }
};

// Claim bingo
const claimBingo = async (req, res) => {
  try {
    const { gameId, telegramId } = req.body;

    const game = await localDB.findGame(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (game.gameEnded) {
      return res.status(400).json({
        success: false,
        message: 'Game has already ended'
      });
    }

    const player = game.players.find(p => p.telegramId === telegramId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found in game'
      });
    }

    // Check if player actually has bingo
    if (!checkBingoWin(player.bingoCard, player.markedNumbers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bingo claim'
      });
    }

    // End the game and set winner
    await localDB.updateGame(gameId, {
      gameEnded: true,
      winner: telegramId,
      endedAt: new Date().toISOString()
    });

    // Update player status
    const updatedPlayers = game.players.map(p => ({
      ...p,
      hasBingo: p.telegramId === telegramId
    }));

    await localDB.updateGame(gameId, { players: updatedPlayers });

    // Distribute winnings
    const winner = game.players.find(p => p.telegramId === telegramId);
    const winnings = game.potAmount;
    
    await localDB.updateUser(telegramId, {
      balance: winner.balance + winnings,
      gamesWon: winner.gamesWon + 1,
      totalWinnings: winner.totalWinnings + winnings
    });

    // Create winning transaction
    await localDB.createTransaction({
      userId: winner.userId,
      telegramId: winner.telegramId,
      type: 'win',
      amount: winnings,
      balanceBefore: winner.balance,
      balanceAfter: winner.balance + winnings,
      gameId: game.id,
      description: `Won ${winnings} ETB in bingo game ${gameId}`,
      paymentMethod: 'game'
    });

    res.json({
      success: true,
      message: 'Bingo! You won!',
      data: {
        winner: winner.username,
        winnings: winnings,
        gameEnded: true
      }
    });

  } catch (error) {
    console.error('Claim bingo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while claiming bingo'
    });
  }
};

// Create new game
const createGame = async (req, res) => {
  try {
    const { betAmount, telegramId } = req.body;

    // Validate bet amount
    if (![10, 20, 50, 100].includes(betAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bet amount. Must be 10, 20, 50, or 100 ETB'
      });
    }

    // Check if user exists and has sufficient balance
    const user = await localDB.findUser(telegramId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.balance < betAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Create new game
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const game = await localDB.createGame({
      gameId,
      betAmount,
      potAmount: betAmount,
      status: 'waiting',
      maxPlayers: 4,
      minPlayers: 2,
      calledNumbers: [],
      currentNumber: null,
      gameStarted: false,
      gameEnded: false,
      winner: null,
      cardSelectionMode: false,
      currentPlayerTurn: null,
      playerSelectedCards: {},
      players: [{
        userId: user.id,
        telegramId: user.telegramId,
        username: user.username,
        bingoCard: [],
        markedNumbers: [],
        selectedCards: [],
        hasBingo: false,
        joinedAt: new Date().toISOString()
      }]
    });

    // Deduct bet from user balance
    await localDB.updateUser(telegramId, {
      balance: user.balance - betAmount,
      currentGame: game.id
    });

    // Create bet transaction
    await localDB.createTransaction({
      userId: user.id,
      telegramId: user.telegramId,
      type: 'bet',
      amount: -betAmount,
      balanceBefore: user.balance,
      balanceAfter: user.balance - betAmount,
      gameId: game.id,
      description: `Bet ${betAmount} ETB for game ${gameId}`,
      paymentMethod: 'game'
    });

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: {
        game: {
          id: game.id,
          gameId: game.gameId,
          betAmount: game.betAmount,
          potAmount: game.potAmount,
          status: game.status,
          players: game.players.length,
          maxPlayers: game.maxPlayers
        }
      }
    });

  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating game'
    });
  }
};

// Join existing game
const joinGame = async (req, res) => {
  try {
    const { gameId, telegramId } = req.body;

    const game = await localDB.findGame(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Game is not accepting new players'
      });
    }

    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Game is full'
      });
    }

    // Check if user is already in the game
    const existingPlayer = game.players.find(p => p.telegramId === telegramId);
    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this game'
      });
    }

    // Check user balance
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.balance < game.betAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Add player to game
    game.players.push({
      userId: user._id,
      telegramId: user.telegramId,
      username: user.username,
      bingoCard: generateBingoCard(),
      markedNumbers: ['FREE']
    });

    game.potAmount += game.betAmount;
    await game.save();

    // Deduct bet from user balance
    user.balance -= game.betAmount;
    user.currentGame = game._id;
    await user.save();

    // Create bet transaction
    const transaction = new Transaction({
      userId: user._id,
      telegramId: user.telegramId,
      type: 'bet',
      amount: -game.betAmount,
      balanceBefore: user.balance + game.betAmount,
      balanceAfter: user.balance,
      gameId: game._id,
      description: `Bet ${game.betAmount} ETB for game ${gameId}`,
      paymentMethod: 'game'
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Joined game successfully',
      data: {
        game: {
          id: game._id,
          gameId: game.gameId,
          betAmount: game.betAmount,
          potAmount: game.potAmount,
          status: game.status,
          players: game.players.length,
          maxPlayers: game.maxPlayers
        }
      }
    });

  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while joining game'
    });
  }
};

// Start game when enough players join
const startGame = async (gameId) => {
  try {
    const game = await localDB.findGame(gameId);
    if (!game) return;

    if (game.players.length >= game.minPlayers && !game.gameStarted) {
      // Start card selection mode
      await localDB.updateGame(gameId, {
        cardSelectionMode: true,
        currentPlayerTurn: game.players[0].telegramId, // Start with first player
        status: 'selecting'
      });
    }
  } catch (error) {
    console.error('Start game error:', error);
  }
};

// Auto-call numbers for the game
const startAutoCalling = async (gameId) => {
  const callInterval = setInterval(async () => {
    try {
      const game = await localDB.findGame(gameId);
      if (!game || game.gameEnded) {
        clearInterval(callInterval);
        return;
      }

      await callNextNumber({ params: { gameId } }, { json: () => {} });
    } catch (error) {
      console.error('Auto-calling error:', error);
    }
  }, 5000); // Call every 5 seconds
};

// Get game status
const getGameStatus = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findOne({ gameId }).populate('players.userId', 'username firstName');
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: {
        game: {
          id: game._id,
          gameId: game.gameId,
          betAmount: game.betAmount,
          potAmount: game.potAmount,
          status: game.status,
          players: game.players.map(p => ({
            telegramId: p.telegramId,
            username: p.username,
            hasWon: p.hasWon
          })),
          calledNumbers: game.calledNumbers.map(cn => cn.number),
          winner: game.winner,
          startedAt: game.startedAt,
          endedAt: game.endedAt
        }
      }
    });

  } catch (error) {
    console.error('Get game status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching game status'
    });
  }
};

// Mark number on player's card
const markNumber = async (req, res) => {
  try {
    const { gameId, telegramId, number } = req.body;

    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    const player = game.players.find(p => p.telegramId === telegramId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found in game'
      });
    }

    // Check if number is called
    const isCalled = game.calledNumbers.some(cn => cn.number === number);
    if (!isCalled && number !== 'FREE') {
      return res.status(400).json({
        success: false,
        message: 'Number not called yet'
      });
    }

    // Mark number if not already marked
    if (!player.markedNumbers.includes(number)) {
      player.markedNumbers.push(number);
    }

    // Check for win
    if (checkBingoWin(player.bingoCard, player.markedNumbers)) {
      player.hasWon = true;
      game.status = 'finished';
      game.winner = {
        userId: player.userId,
        telegramId: player.telegramId,
        username: player.username,
        wonAt: new Date()
      };
      game.endedAt = new Date();

      // Award winnings
      const user = await User.findById(player.userId);
      if (user) {
        user.balance += game.potAmount;
        user.gamesPlayed += 1;
        user.gamesWon += 1;
        user.totalWinnings += game.potAmount;
        user.currentGame = null;
        await user.save();

        // Create win transaction
        const transaction = new Transaction({
          userId: user._id,
          telegramId: user.telegramId,
          type: 'win',
          amount: game.potAmount,
          balanceBefore: user.balance - game.potAmount,
          balanceAfter: user.balance,
          gameId: game._id,
          description: `Won ${game.potAmount} ETB in game ${gameId}`,
          paymentMethod: 'game'
        });

        await transaction.save();
      }
    }

    await game.save();

    res.json({
      success: true,
      message: 'Number marked successfully',
      data: {
        markedNumbers: player.markedNumbers,
        hasWon: player.hasWon,
        gameStatus: game.status
      }
    });

  } catch (error) {
    console.error('Mark number error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking number'
    });
  }
};

// Call next number (for auto-calling)
const callNextNumber = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (game.status !== 'playing') {
      return res.status(400).json({
        success: false,
        message: 'Game is not in playing state'
      });
    }

    // Get available numbers (1-90, excluding already called) - Geez Bingo
    const calledNumbers = game.calledNumbers.map(cn => cn.number);
    const availableNumbers = [];
    for (let i = 1; i <= 90; i++) {
      if (!calledNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }

    if (availableNumbers.length === 0) {
      // Game is complete, no winner
      game.status = 'finished';
      game.endedAt = new Date();
      await game.save();

      return res.json({
        success: true,
        message: 'Game finished - no winner',
        data: {
          gameStatus: game.status,
          calledNumbers: calledNumbers
        }
      });
    }

    // Call random number
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const calledNumber = availableNumbers[randomIndex];

    game.calledNumbers.push({
      number: calledNumber,
      calledAt: new Date()
    });

    // Auto-mark called numbers on all players' cards
    const updatedPlayers = game.players.map(player => {
      const updatedMarkedNumbers = [...player.markedNumbers];
      
      // Check if player has this number on their card
      if (player.bingoCard && player.bingoCard.includes(calledNumber)) {
        if (!updatedMarkedNumbers.includes(calledNumber)) {
          updatedMarkedNumbers.push(calledNumber);
        }
      }
      
      return {
        ...player,
        markedNumbers: updatedMarkedNumbers
      };
    });

    game.players = updatedPlayers;
    game.currentNumber = calledNumber;

    // Check for bingo winners
    for (const player of game.players) {
      if (checkBingoWin(player.bingoCard, player.markedNumbers)) {
        // Found a winner!
        game.gameEnded = true;
        game.winner = player.telegramId;
        game.endedAt = new Date();
        
        // Update winner's balance
        const winner = await localDB.findUser(player.telegramId);
        if (winner) {
          await localDB.updateUser(player.telegramId, {
            balance: winner.balance + game.potAmount,
            gamesWon: (winner.gamesWon || 0) + 1,
            totalWinnings: (winner.totalWinnings || 0) + game.potAmount
          });

          // Create winning transaction
          await localDB.createTransaction({
            userId: winner.id,
            telegramId: winner.telegramId,
            type: 'win',
            amount: game.potAmount,
            balanceBefore: winner.balance,
            balanceAfter: winner.balance + game.potAmount,
            gameId: game.id,
            description: `Won ${game.potAmount} ETB in bingo game ${game.gameId}`,
            paymentMethod: 'game'
          });
        }
        break;
      }
    }

    await localDB.updateGame(game.gameId, game);

    res.json({
      success: true,
      message: 'Number called successfully',
      data: {
        calledNumber,
        calledNumbers: game.calledNumbers.map(cn => cn.number),
        remainingNumbers: availableNumbers.length - 1
      }
    });

  } catch (error) {
    console.error('Call number error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calling number'
    });
  }
};

module.exports = {
  createGame,
  joinGame,
  getGameStatus,
  markNumber,
  callNextNumber,
  selectCard,
  claimBingo,
  generateBingoCard,
  checkBingoWin
}; 