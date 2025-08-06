const mongoose = require('mongoose');

const connectDBLocal = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/yegna-bingo');
    console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to Local MongoDB: ${error.message}`);
    console.log('💡 To install MongoDB locally: sudo apt-get install mongodb');
  }
};

module.exports = connectDBLocal; 