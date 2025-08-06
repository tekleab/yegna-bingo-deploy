const mongoose = require('mongoose');
const fs = require('fs');

// New MongoDB Atlas connection string (you'll get this from Atlas)
const NEW_CONNECTION_STRING = 'mongodb+srv://yegna_bingo_user:YegnaBingo2024!@cluster0.xxxxx.mongodb.net/yegna-bingo';

async function quickSetup() {
  console.log('🚀 Yegna Bingo - Quick MongoDB Setup\n');
  
  console.log('📋 Step 1: Create MongoDB Atlas Cluster');
  console.log('1. Go to: https://cloud.mongodb.com');
  console.log('2. Click "Build a Database"');
  console.log('3. Choose "FREE" tier (M0)');
  console.log('4. Select "AWS" provider');
  console.log('5. Choose "N. Virginia (us-east-1)" region');
  console.log('6. Click "Create"\n');
  
  console.log('📋 Step 2: Set Up Database User');
  console.log('1. Click "Database Access"');
  console.log('2. Click "Add New Database User"');
  console.log('3. Username: yegna_bingo_user');
  console.log('4. Password: YegnaBingo2024!');
  console.log('5. Role: "Read and write to any database"');
  console.log('6. Click "Add User"\n');
  
  console.log('📋 Step 3: Set Up Network Access');
  console.log('1. Click "Network Access"');
  console.log('2. Click "Add IP Address"');
  console.log('3. Click "Allow Access from Anywhere"');
  console.log('4. Click "Confirm"\n');
  
  console.log('📋 Step 4: Get Connection String');
  console.log('1. Go back to "Database" tab');
  console.log('2. Click "Connect" on your cluster');
  console.log('3. Choose "Connect your application"');
  console.log('4. Copy the connection string\n');
  
  console.log('📋 Step 5: Update Configuration');
  console.log('Replace the connection string in the config file');
  console.log('Expected format:');
  console.log('mongodb+srv://yegna_bingo_user:YegnaBingo2024!@cluster0.xxxxx.mongodb.net/yegna-bingo\n');
  
  // Update the database config with new connection string
  const configContent = `const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('${NEW_CONNECTION_STRING}');
    console.log(\`✅ MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`❌ Error connecting to MongoDB: \${error.message}\`);
    console.log('⚠️  Continuing without database connection...');
  }
};

module.exports = connectDB;`;
  
  fs.writeFileSync('./config/database.js', configContent);
  console.log('✅ Updated database configuration');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Complete the MongoDB Atlas setup above');
  console.log('2. Replace the connection string in config/database.js');
  console.log('3. Run: npm start');
  console.log('4. Test with: curl http://localhost:5000/health');
  
  console.log('\n💡 Need help? Just share your connection string with me!');
}

quickSetup(); 