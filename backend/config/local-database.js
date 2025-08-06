const { LocalDatabase } = require('../local-mongo-setup');

// Initialize local database
const localDB = new LocalDatabase();

// Mock MongoDB-like interface for compatibility
const connectDB = async () => {
  try {
    console.log('✅ Local Database Connected Successfully!');
    console.log('📁 Data stored in: backend/data/');
    return localDB;
  } catch (error) {
    console.error(`❌ Error connecting to Local Database: ${error.message}`);
    throw error;
  }
};

// Export for use in controllers
module.exports = { connectDB, localDB }; 