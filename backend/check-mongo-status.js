const https = require('https');
const dns = require('dns').promises;

async function checkMongoDBStatus() {
  console.log('🔍 Checking MongoDB Atlas Status...\n');
  
  // Check DNS resolution
  try {
    console.log('1️⃣ Testing DNS resolution...');
    const addresses = await dns.resolve4('cluster0.okakmhl.mongodb.net');
    console.log('✅ DNS resolved successfully:', addresses);
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
  }
  
  // Check if we can reach MongoDB Atlas
  try {
    console.log('\n2️⃣ Testing MongoDB Atlas connectivity...');
    const result = await new Promise((resolve, reject) => {
      const req = https.get('https://cloud.mongodb.com', (res) => {
        console.log('✅ MongoDB Atlas website is accessible');
        resolve(res.statusCode);
      });
      
      req.setTimeout(5000, () => {
        reject(new Error('Timeout'));
      });
      
      req.on('error', reject);
    });
  } catch (error) {
    console.log('❌ Cannot reach MongoDB Atlas:', error.message);
  }
  
  console.log('\n📋 Troubleshooting Steps:');
  console.log('1. Check your internet connection');
  console.log('2. Verify MongoDB Atlas cluster is running');
  console.log('3. Check if cluster is paused (free tier)');
  console.log('4. Verify connection string is correct');
  console.log('5. Check firewall/network restrictions');
  
  console.log('\n🔗 MongoDB Atlas Dashboard:');
  console.log('https://cloud.mongodb.com');
  
  console.log('\n📞 Your Connection String:');
  console.log('mongodb+srv://tekleabhhadush:MfxSFaeCixy5L4ZA@cluster0.okakmhl.mongodb.net/yegna-bingo');
  
  console.log('\n💡 Alternative Solutions:');
  console.log('1. Use local MongoDB for development');
  console.log('2. Use MongoDB Atlas free tier (may be paused)');
  console.log('3. Check cluster status in Atlas dashboard');
}

checkMongoDBStatus(); 