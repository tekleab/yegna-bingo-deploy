const mongoose = require('mongoose');

async function simpleTest() {
  console.log('🔍 Simple MongoDB Connection Test\n');
  
  const connectionString = 'mongodb+srv://tekleabhhadush:semutek123@cluster0.hr8kk.mongodb.net/yegna-bingo?retryWrites=true&w=majority&appName=Cluster0';
  
  console.log('📞 Connection String:');
  console.log(connectionString);
  console.log('\n🔌 Attempting connection...');
  
  try {
    // Try with different options
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      family: 4 // Force IPv4
    };
    
    await mongoose.connect(connectionString, options);
    console.log('✅ Connection successful!');
    
    // Test basic operations
    const db = mongoose.connection.db;
    console.log('📁 Database name:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Possible solutions:');
    console.log('1. Check if cluster is paused in MongoDB Atlas');
    console.log('2. Verify the cluster name: cluster0.hr8kk.mongodb.net');
    console.log('3. Check if the cluster is in a different region');
    console.log('4. Try creating a new cluster');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected');
    }
  }
}

simpleTest(); 