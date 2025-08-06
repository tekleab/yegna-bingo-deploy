# 🎮 Yegna Bingo - Telegram Bot with Web UI

A complete Bingo game system with Telegram bot integration and beautiful web interface.

## 🚀 Features

- **Telegram Bot**: Registration, wallet management, game creation
- **Web UI**: Beautiful Bingo interface with real-time gameplay
- **Auto Number Calling**: Numbers called automatically every 3 seconds
- **Card Marking**: Click to mark numbers on your Bingo card
- **Win Detection**: Automatic Bingo pattern detection
- **Real-time Updates**: Live game status and called numbers

## 📱 Telegram Bot Commands

- `/start` - Start bot and register
- `/play` - Start playing bingo
- `/launch` - Open web UI
- `/deposit` - Add balance to wallet
- `/check_balance` - Check your balance
- `/transaction` - View transaction history
- `/transfer` - Transfer funds
- `/help` - Get help
- `/contact` - Contact support

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Telegram Bot Token (from @BotFather)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd yegna-bingo
```

### 2. Install Dependencies

#### Bot Dependencies
```bash
cd bot
npm install
```

#### Web UI Dependencies
```bash
cd ../web-ui
npm install
```

### 3. Configure Bot Token
Edit `bot/bot.js` and replace `YOUR_BOT_TOKEN_HERE` with your actual Telegram bot token.

### 4. Start the Services

#### Start Bot (Terminal 1)
```bash
cd bot
npm start
```

#### Start Web UI (Terminal 2)
```bash
cd web-ui
npm run dev
```

### 5. Access the System
- **Bot**: Search for your bot on Telegram
- **Web UI**: http://localhost:3000
- **Bot API**: http://localhost:3001

## 🎯 How to Play

1. **Register**: Send `/start` to the bot and share your phone number
2. **Deposit**: Add funds to your wallet using `/deposit`
3. **Play**: Send `/play` and choose your bet amount
4. **Launch Web UI**: Click "Launch Web UI" to open the game interface
5. **Mark Numbers**: Click on numbers that are called
6. **Win**: Get 5 in a row and claim your Bingo!

## 🌐 Deployment

### Bot Deployment (Railway/Heroku)
```bash
cd bot
# Add your bot token as environment variable
# Deploy to your preferred platform
```

### Web UI Deployment (Vercel/Netlify)
```bash
cd web-ui
npm run build
# Deploy the dist folder
```

### Environment Variables
- `BOT_TOKEN` - Your Telegram bot token
- `WEB_UI_URL` - Your deployed web UI URL
- `PORT` - Port for bot API server

## 📁 Project Structure

```
yegna-bingo/
├── bot/
│   ├── bot.js          # Main bot logic
│   ├── package.json    # Bot dependencies
│   └── README.md       # Bot documentation
├── web-ui/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── App.jsx     # Main app component
│   │   └── main.jsx    # Entry point
│   ├── package.json    # Web UI dependencies
│   └── vite.config.js  # Vite configuration
└── README.md           # This file
```

## 🔧 Customization

### Bot Customization
- Edit `bot/bot.js` to modify bot commands and logic
- Add database integration for persistent storage
- Implement payment gateways for deposits

### Web UI Customization
- Modify `web-ui/src/App.jsx` for game logic changes
- Update `web-ui/src/index.css` for styling
- Add new components in `web-ui/src/components/`

## 🎨 Features Based on Screenshots

✅ **Registration Flow**: Phone number sharing for registration
✅ **Wallet System**: Balance checking and transactions
✅ **Bet Selection**: Multiple bet amounts (10, 20, 50, 100 ETB)
✅ **Web UI Launch**: Telegram Web App integration
✅ **Auto Number Calling**: Every 2-3 seconds as requested
✅ **Card Marking**: Click to mark called numbers
✅ **Bingo Detection**: Win pattern checking
✅ **Game Statistics**: Real-time game info display

## 🚀 Ready for Deployment

The system is now ready for deployment! Just:
1. Replace the bot token
2. Deploy bot to your preferred platform
3. Deploy web UI to Vercel/Netlify
4. Update the web UI URL in the bot
5. Share your bot with users!

## 📞 Support

For support, contact: @yegna_bingo_support
