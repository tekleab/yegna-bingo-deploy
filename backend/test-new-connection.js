const mongoose = require('mongoose');

async function testNewConnection() {
  console.log('🔍 Testing New MongoDB Connection\n');
  
  // This will be updated with your actual connection string
  const connectionString = 'mongodb+srv://yegna_bingo_user:YegnaBingo2024!@cluster0.xxxxx.mongodb.net/yegna-bingo';
  
  console.log('📞 Current Connection String:');
  console.log(connectionString);
  console.log('\n⚠️  Please update this with your actual connection string from MongoDB Atlas');
  
  try {
    console.log('\n🔌 Attempting to connect...');
    await mongoose.connect(connectionString);
    
    console.log('✅ Connection successful!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections in database`);
    
    // Test creating a collection
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Database write test successful');
    
    const testDoc = await testCollection.findOne({ test: 'connection' });
    console.log('✅ Database read test successful');
    
    // Clean up test data
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Database cleanup successful');
    
    console.log('\n🎉 All tests passed! Your MongoDB is working perfectly!');
    console.log('🚀 You can now start the backend with: npm start');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Please check:');
    console.log('1. Your connection string is correct');
    console.log('2. Database user exists and password is correct');
    console.log('3. Network access is configured (0.0.0.0/0)');
    console.log('4. Cluster is running and not paused');
    console.log('\n📋 To update connection string:');
    console.log('1. Edit backend/config/database.js');
    console.log('2. Replace the connection string');
    console.log('3. Run this test again');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testNewConnection(); 