const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const config = require('./config');

// Bot Configuration
const BOT_TOKEN = config.BOT_TOKEN;
const WEB_UI_URL = config.WEB_UI_URL;

const bot = new Telegraf(BOT_TOKEN);

// In-memory storage (replace with database in production)
const users = new Map();
const games = new Map();

// Express server for web UI
const app = express();
app.use(cors());
app.use(express.json());

// User registration
bot.command('start', async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;
  
  try {
    // Check if user is already registered
    const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
    
    if (response.data.success) {
      // User is already registered - show game menu
      const user = response.data.data.user;
      ctx.reply(`🎮 Welcome back to Yegna Bingo!

💰 Your Balance: ${user.balance} ETB
🎯 Ready to play!`, {
        reply_markup: {
          keyboard: [
            ['🎮 Play Game', '🌐 Launch Web UI'],
            ['💰 Check Balance', '📊 Transactions'],
            ['❓ Help', '📞 Contact']
          ],
          resize_keyboard: true
        }
      });
    } else {
      // User not registered - show registration
      ctx.reply(`🎮 Welcome to Yegna Bingo!

To start playing, you need to register first.
Click the button below to share your phone number:`, {
        reply_markup: {
          keyboard: [
            [{ text: '📱 Share Contact', request_contact: true }]
          ],
          resize_keyboard: true
        }
      });
    }
  } catch (error) {
    console.error('Start command error:', error);
    // If API fails, show registration as fallback
    ctx.reply(`🎮 Welcome to Yegna Bingo!

To start playing, you need to register first.
Click the button below to share your phone number:`, {
      reply_markup: {
        keyboard: [
          [{ text: '📱 Share Contact', request_contact: true }]
        ],
        resize_keyboard: true
      }
    });
  }
});

// Handle contact sharing for registration
bot.on('contact', async (ctx) => {
  const userId = ctx.from.id;
  const contact = ctx.message.contact;
  
  if (contact.user_id === userId) {
    try {
      // Register user with backend API
      const response = await axios.post('http://localhost:5000/api/users/register', {
        telegramId: userId.toString(),
        username: ctx.from.username || ctx.from.first_name,
        firstName: ctx.from.first_name,
        phoneNumber: contact.phone_number
      });

      if (response.data.success) {
        const user = response.data.data.user;
        
        ctx.reply(`✅ Registration successful!
        
💰 Welcome bonus: 10 ETB
📱 Phone: ${contact.phone_number}

You can now start playing!`, {
          reply_markup: {
            keyboard: [
              ['🎮 Play Game', '🌐 Launch Web UI'],
              ['💰 Check Balance', '📊 Transactions'],
              ['❓ Help', '📞 Contact']
            ],
            resize_keyboard: true
          }
        });
      } else if (response.data.message === 'User already registered') {
        // User is already registered - show game menu
        ctx.reply(`✅ Welcome back!
        
You are already registered and ready to play!`, {
          reply_markup: {
            keyboard: [
              ['🎮 Play Game', '🌐 Launch Web UI'],
              ['💰 Check Balance', '📊 Transactions'],
              ['❓ Help', '📞 Contact']
            ],
            resize_keyboard: true
          }
        });
      } else {
        ctx.reply('❌ Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      ctx.reply('❌ Registration failed. Please try again later.');
    }
  } else {
    ctx.reply('❌ Please share your own phone number.');
  }
});

// Check balance
bot.command('check_balance', (ctx) => {
  const userId = ctx.from.id;
  const user = users.get(userId);
  
  if (!user || !user.registered) {
    return ctx.reply('❌ Please register first using /start');
  }
  
  ctx.reply(`💰 Your Balance: ${user.balance} ETB`);
});

bot.hears('💰 Check Balance', async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${userId}/balance`);
    
    if (response.data.success) {
      ctx.reply(`💰 Your Balance: ${response.data.data.balance} ETB`);
    } else {
      ctx.reply('❌ Please register first using /start');
    }
  } catch (error) {
    console.error('Balance check error:', error);
    ctx.reply('❌ Please register first using /start');
  }
});

// Play game
bot.command('play', (ctx) => {
  const userId = ctx.from.id;
  const user = users.get(userId);
  
  if (!user || !user.registered) {
    return ctx.reply('❌ Please register first using /start');
  }
  
  ctx.reply('Choose Your Bet:', {
    reply_markup: {
      keyboard: [
        ['🎮 Play 10 Birr', '🎮 Play 20 Birr'],
        ['🎮 Play 50 Birr', '🎮 Play 100 Birr'],
        ['🔙 Back to Menu']
      ],
      resize_keyboard: true
    }
  });
});

bot.hears('🎮 Play Game', async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
    
    if (response.data.success) {
      const user = response.data.data.user;
      
      if (user.balance < 10) {
        return ctx.reply('❌ Insufficient balance. You need at least 10 ETB to play.');
      }
      
      ctx.reply('🎮 Choose Your Bet:', {
        reply_markup: {
          keyboard: [
            ['🎮 Play 10 Birr', '🎮 Play 20 Birr'],
            ['🎮 Play 50 Birr', '🎮 Play 100 Birr'],
            ['🔙 Back to Menu']
          ],
          resize_keyboard: true
        }
      });
    } else {
      ctx.reply('❌ Please register first using /start');
    }
  } catch (error) {
    console.error('Play Game error:', error);
    ctx.reply('❌ Failed to load user data. Please try again.');
  }
});

// Handle bet selection
bot.hears(/🎮 Play (\d+) Birr/, async (ctx) => {
  const bet = parseInt(ctx.match[1]);
  const userId = ctx.from.id;
  
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
    
    if (response.data.success) {
      const user = response.data.data.user;
      
      if (user.balance < bet) {
        return ctx.reply(`❌ Insufficient balance. You have ${user.balance} ETB, but need ${bet} ETB to play.`);
      }
      
      // Create game session via backend
      const gameResponse = await axios.post('http://localhost:5000/api/games/create', {
        telegramId: userId.toString(),
        betAmount: bet
      });
      
      if (gameResponse.data.success) {
        ctx.reply(`🎮 Game created!
Bet: ${bet} ETB
Players: 1/4
Waiting for more players...`, {
          reply_markup: {
            keyboard: [
              ['🌐 Launch Web UI', '❌ Cancel Game'],
              ['📊 Game Status']
            ],
            resize_keyboard: true
          }
        });
      } else {
        ctx.reply('❌ Failed to create game. Please try again.');
      }
    } else {
      ctx.reply('❌ Please register first using /start');
    }
  } catch (error) {
    console.error('Bet selection error:', error);
    ctx.reply('❌ Failed to create game. Please try again.');
  }
});

// Launch Web UI
bot.command('launch', (ctx) => {
  const userId = ctx.from.id;
  const user = users.get(userId);
  
  if (!user || !user.registered) {
    return ctx.reply('❌ Please register first using /start');
  }
  
  // Check if we're in production (HTTPS) or development (HTTP)
  const isProduction = WEB_UI_URL.startsWith('https://');
  
  if (isProduction) {
    // Production: Use Web App button
    ctx.reply('🌐 Launch Yegna Bingo Web UI', {
      reply_markup: {
        keyboard: [
          [{ text: '🌐 Open Web UI', web_app: { url: `${WEB_UI_URL}?user=${userId}` } }],
          ['🎮 Play Game', '💰 Check Balance'],
          ['📊 Transactions', '❓ Help']
        ],
        resize_keyboard: true
      }
    });
  } else {
    // Development: Provide URL as text
    ctx.reply(`🌐 Launch Yegna Bingo Web UI

Your game interface is ready! 

For local testing, open this URL in your browser:
${WEB_UI_URL}?user=${userId}

In production, this will open directly in Telegram!`, {
      reply_markup: {
        keyboard: [
          ['🎮 Play Game', '💰 Check Balance'],
          ['📊 Transactions', '🌐 Launch Web UI'],
          ['❓ Help', '📞 Contact']
        ],
        resize_keyboard: true
      }
    });
  }
});

bot.hears('🌐 Launch Web UI', async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
    
    if (response.data.success) {
      // Check if we're in production (HTTPS) or development (HTTP)
      const isProduction = WEB_UI_URL.startsWith('https://');
      
      if (isProduction) {
        // Production: Use Web App button
        ctx.reply('🌐 Launch Yegna Bingo Web UI', {
          reply_markup: {
            keyboard: [
              [{ text: '🌐 Open Web UI', web_app: { url: `${WEB_UI_URL}?user=${userId}` } }],
              ['🎮 Play Game', '💰 Check Balance'],
              ['📊 Transactions', '❓ Help']
            ],
            resize_keyboard: true
          }
        });
      } else {
        // Development: Provide URL as text
        ctx.reply(`🌐 Launch Yegna Bingo Web UI

Your game interface is ready! 

For local testing, open this URL in your browser:
${WEB_UI_URL}?user=${userId}

In production, this will open directly in Telegram!`, {
          reply_markup: {
            keyboard: [
              ['🎮 Play Game', '💰 Check Balance'],
              ['📊 Transactions', '🌐 Launch Web UI'],
              ['❓ Help', '📞 Contact']
            ],
            resize_keyboard: true
          }
        });
      }
    } else {
      ctx.reply('❌ Please register first using /start');
    }
  } catch (error) {
    console.error('Launch Web UI error:', error);
    ctx.reply('❌ Failed to load user data. Please try again.');
  }
});

// Handle web app data
bot.on('web_app_data', (ctx) => {
  const data = ctx.message.web_app_data.data;
  console.log('Web app data received:', data);
  // Handle data from web UI
});

// Deposit
bot.command('deposit', (ctx) => {
  ctx.reply('Please select the bank you want to deposit from:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'TeleBirr', callback_data: 'deposit_telebirr' },
          { text: 'MPESSA', callback_data: 'deposit_mpessa' }
        ],
        [
          { text: 'CBE', callback_data: 'deposit_cbe' }
        ]
      ]
    }
  });
});

// Handle deposit callbacks
bot.action(/deposit_(.+)/, (ctx) => {
  const bank = ctx.match[1];
  ctx.reply(`💳 ${bank.toUpperCase()} deposit coming soon!
Contact support for manual deposit.`);
});

// Transactions
bot.command('transaction', (ctx) => {
  const userId = ctx.from.id;
  const user = users.get(userId);
  
  if (!user || !user.registered) {
    return ctx.reply('❌ Please register first using /start');
  }
  
  ctx.reply('No transactions found.');
});

bot.hears('📊 Transactions', async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    const response = await axios.get(`http://localhost:5000/api/users/${userId}/transactions`);
    
    if (response.data.success && response.data.data.transactions.length > 0) {
      const transactions = response.data.data.transactions;
      let message = '📊 Your Recent Transactions:\n\n';
      
      transactions.slice(0, 5).forEach((tx, index) => {
        const date = new Date(tx.createdAt).toLocaleDateString();
        const type = tx.type === 'bonus' ? '🎁' : tx.type === 'win' ? '🏆' : '💰';
        message += `${index + 1}. ${type} ${tx.type.toUpperCase()}: ${tx.amount} ETB\n`;
        message += `   📅 ${date} - ${tx.description}\n\n`;
      });
      
      ctx.reply(message);
    } else {
      ctx.reply('📊 No transactions found yet.');
    }
  } catch (error) {
    console.error('Transaction error:', error);
    ctx.reply('❌ Failed to load transactions. Please try again.');
  }
});

// Transfer
bot.command('transfer', (ctx) => {
  const userId = ctx.from.id;
  const user = users.get(userId);
  
  if (!user || !user.registered) {
    return ctx.reply('❌ Please register first using /start');
  }
  
  ctx.reply('You need to play at least 2 games before transferring funds. 🚨');
});

// Help
bot.command('help', (ctx) => {
  ctx.reply(`🎮 Yegna Bingo - Help

Commands:
/start - Start bot and register
/play - Start playing bingo
/launch - Open web UI
/deposit - Add balance to wallet
/check_balance - Check my balance
/register - Register to Yegna bingo
/withdraw - Withdraw balance
/transfer - Transfer funds to other users
/transaction - Get recent transactions
/help - Get support
/contact - Contact Yegna bingo
/instruction - Get game instructions

How to play:
1. Register with your phone number
2. Deposit funds to your wallet
3. Choose your bet amount
4. Launch web UI to play
5. Mark numbers on your card
6. Win and collect your prize!`);
});

bot.hears('❓ Help', (ctx) => {
  ctx.reply(`🎮 Yegna Bingo - Help

Commands:
/start - Start bot and register
/play - Start playing bingo
/launch - Open web UI
/check_balance - Check my balance
/transaction - Get recent transactions
/help - Get support
/contact - Contact Yegna bingo

How to play:
1. Register with your phone number
2. Get your 10 ETB welcome bonus
3. Choose your bet amount
4. Launch web UI to play
5. Mark numbers on your card
6. Win and collect your prize!

Need help? Contact us at @yegna_bingo_support`);
});

// Contact
bot.command('contact', (ctx) => {
  ctx.reply('You can contact us at @yegna_bingo_support');
});

bot.hears('📞 Contact', (ctx) => {
  ctx.reply(`📞 Contact Yegna Bingo Support

For any questions or support:
• Telegram: @yegna_bingo_support
• Email: support@yegnabingo.com
• Phone: +251 911 123 456

We're here to help! 🎮`);
});

// Back to menu
bot.hears('🔙 Back to Menu', (ctx) => {
  const userId = ctx.from.id;
  const user = users.get(userId);
  
  if (user && user.registered) {
    ctx.reply('Main Menu:', {
      reply_markup: {
        keyboard: [
          ['🎮 Play Game', '💰 Check Balance'],
          ['📊 Transactions', '🌐 Launch Web UI'],
          ['❓ Help', '📞 Contact']
        ],
        resize_keyboard: true
      }
    });
  } else {
    ctx.reply('Please register first using /start');
  }
});

// API endpoints for web UI
app.get('/api/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.get(userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

app.get('/api/game/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const game = games.get(gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.json(game);
});

app.post('/api/game/:gameId/join', (req, res) => {
  const gameId = req.params.gameId;
  const { userId } = req.body;
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  if (!game.players.includes(userId)) {
    game.players.push(userId);
  }
  
  res.json(game);
});

// Start bot and server
const PORT = process.env.PORT || 3001;

bot.launch().then(() => {
  console.log('✅ Yegna Bingo Bot is running!');
});

app.listen(PORT, () => {
  console.log(`🌐 Bot API server running on port ${PORT}`);
  console.log(`🌐 Web UI should be accessible at: ${WEB_UI_URL}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 