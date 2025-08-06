const mongoose = require('mongoose');

async function testMongoDB() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://tekleabhhadush:semutek123@cluster0.hr8kk.mongodb.net/yegna-bingo?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ MongoDB Connected Successfully!');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('\n📊 Available Databases:');
    dbs.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check yegna-bingo database collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections in yegna-bingo:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check if we have any data
    if (collections.length > 0) {
      console.log('\n📈 Data Summary:');
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} documents`);
        
        if (count > 0) {
          // Show first document as sample
          const sample = await db.collection(col.name).findOne();
          console.log(`    Sample: ${JSON.stringify(sample, null, 2).substring(0, 200)}...`);
        }
      }
    }
    
    console.log('\n🎉 MongoDB test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB Test Failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testMongoDB(); 