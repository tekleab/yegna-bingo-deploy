const { localDB } = require('../config/local-database');

// Register new user
const registerUser = async (req, res) => {
  try {
    const { telegramId, username, firstName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await localDB.findUser(telegramId);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already registered'
      });
    }

    // Create new user with 10 ETB bonus
    const newUser = await localDB.createUser({
      telegramId,
      username,
      firstName,
      phoneNumber,
      balance: 10,
      isRegistered: true,
      gamesPlayed: 0,
      gamesWon: 0,
      totalWinnings: 0,
      currentGame: null
    });

    // Create welcome bonus transaction
    await localDB.createTransaction({
      telegramId,
      type: 'bonus',
      amount: 10,
      balanceBefore: 0,
      balanceAfter: 10,
      description: 'Welcome bonus'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Get user by Telegram ID
const getUser = async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await localDB.findUser(telegramId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
};

// Get user balance
const getBalance = async (req, res) => {
  try {
    const { telegramId } = req.params;
    const user = await localDB.findUser(telegramId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        balance: user.balance,
        currency: 'ETB'
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get balance'
    });
  }
};

// Get user transactions
const getTransactions = async (req, res) => {
  try {
    const { telegramId } = req.params;
    const transactions = await localDB.getUserTransactions(telegramId);

    res.json({
      success: true,
      data: { transactions }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
};

// Update user balance
const updateBalance = async (req, res) => {
  try {
    const { telegramId } = req.params;
    const { amount, type, description } = req.body;

    const user = await localDB.findUser(telegramId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + amount;

    // Update user balance
    const updatedUser = await localDB.updateUser(telegramId, {
      balance: balanceAfter
    });

    // Create transaction record
    await localDB.createTransaction({
      telegramId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      description
    });

    res.json({
      success: true,
      data: {
        user: updatedUser,
        transaction: {
          type,
          amount,
          balanceAfter
        }
      }
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update balance'
    });
  }
};

module.exports = {
  registerUser,
  getUser,
  getBalance,
  getTransactions,
  updateBalance
}; 