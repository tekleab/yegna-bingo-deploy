const fs = require('fs');
const path = require('path');

// Simple local database using JSON files
class LocalDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.gamesFile = path.join(this.dataDir, 'games.json');
    this.transactionsFile = path.join(this.dataDir, 'transactions.json');
    
    this.init();
  }
  
  init() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Initialize files if they don't exist
    this.ensureFile(this.usersFile, []);
    this.ensureFile(this.gamesFile, []);
    this.ensureFile(this.transactionsFile, []);
    
    console.log('✅ Local database initialized');
  }
  
  ensureFile(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
  }
  
  readData(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      return [];
    }
  }
  
  writeData(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error);
      return false;
    }
  }
  
  // User operations
  async createUser(userData) {
    const users = this.readData(this.usersFile);
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.writeData(this.usersFile, users);
    return newUser;
  }
  
  async findUser(telegramId) {
    const users = this.readData(this.usersFile);
    return users.find(user => user.telegramId === telegramId);
  }
  
  async updateUser(telegramId, updates) {
    const users = this.readData(this.usersFile);
    const index = users.findIndex(user => user.telegramId === telegramId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.writeData(this.usersFile, users);
      return users[index];
    }
    return null;
  }
  
  // Game operations
  async createGame(gameData) {
    const games = this.readData(this.gamesFile);
    const newGame = {
      id: Date.now().toString(),
      ...gameData,
      createdAt: new Date().toISOString()
    };
    games.push(newGame);
    this.writeData(this.gamesFile, games);
    return newGame;
  }
  
  async findGame(gameId) {
    const games = this.readData(this.gamesFile);
    return games.find(game => game.id === gameId);
  }
  
  // Transaction operations
  async createTransaction(transactionData) {
    const transactions = this.readData(this.transactionsFile);
    const newTransaction = {
      id: Date.now().toString(),
      ...transactionData,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    this.writeData(this.transactionsFile, transactions);
    return newTransaction;
  }
  
  async getUserTransactions(telegramId) {
    const transactions = this.readData(this.transactionsFile);
    return transactions.filter(t => t.telegramId === telegramId);
  }
}

// Test the local database
async function testLocalDB() {
  console.log('🧪 Testing Local Database...\n');
  
  const db = new LocalDatabase();
  
  // Test user creation
  const testUser = await db.createUser({
    telegramId: '123456789',
    username: 'testuser',
    phoneNumber: '+1234567890',
    balance: 10,
    isRegistered: true
  });
  console.log('✅ User created:', testUser.username);
  
  // Test user finding
  const foundUser = await db.findUser('123456789');
  console.log('✅ User found:', foundUser.username);
  
  // Test transaction creation
  const transaction = await db.createTransaction({
    telegramId: '123456789',
    type: 'bonus',
    amount: 10,
    description: 'Welcome bonus'
  });
  console.log('✅ Transaction created:', transaction.type);
  
  console.log('\n🎉 Local database test completed successfully!');
  console.log('📁 Data stored in: backend/data/');
  
  return db;
}

// Export for use in other files
module.exports = { LocalDatabase, testLocalDB };

// Run test if this file is executed directly
if (require.main === module) {
  testLocalDB();
} 