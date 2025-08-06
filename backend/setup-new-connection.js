const mongoose = require('mongoose');
const fs = require('fs');

async function setupNewConnection() {
  console.log('🔧 MongoDB Connection Setup\n');
  
  // Get connection string from user
  console.log('📋 Please provide your new MongoDB connection string:');
  console.log('Format: mongodb+srv://username:password@cluster.xxxxx.mongodb.net/database');
  console.log('\n💡 If you haven\'t created the cluster yet, follow the steps in setup-new-cluster.md');
  
  // For now, let's test with a placeholder
  const testConnectionString = 'mongodb+srv://yegna_bingo_user:YegnaBingo2024!@cluster0.xxxxx.mongodb.net/yegna-bingo';
  
  console.log('\n🔍 Testing connection...');
  console.log('⚠️  Please replace the connection string with your actual one!');
  
  try {
    // Test connection
    await mongoose.connect(testConnectionString);
    console.log('✅ Connection successful!');
    
    // Update config file
    const configPath = './config/database.js';
    const newConfig = `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('${testConnectionString}');
    console.log(\`✅ MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`❌ Error connecting to MongoDB: \${error.message}\`);
    console.log('⚠️  Continuing without database connection...');
  }
};

module.exports = connectDB;`;
    
    fs.writeFileSync(configPath, newConfig);
    console.log('✅ Updated database config file');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections in database`);
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('🚀 You can now start the backend with: npm start');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Please check:');
    console.log('1. Your connection string is correct');
    console.log('2. Database user exists');
    console.log('3. Network access is configured');
    console.log('4. Cluster is running');
  } finally {
    await mongoose.disconnect();
  }
}

setupNewConnection(); 