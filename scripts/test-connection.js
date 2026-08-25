// Test MongoDB Connection
// Quick script to verify your MongoDB credentials work
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...\n');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  console.log('📡 Connecting to MongoDB Atlas...');
  
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Connection successful!\n');

    // Get server info
    const admin = client.db().admin();
    const serverInfo = await admin.serverInfo();
    
    console.log('📊 Server Information:');
    console.log(`  • MongoDB Version: ${serverInfo.version}`);
    console.log(`  • Connection: ${serverInfo.ok === 1 ? 'Active' : 'Inactive'}`);

    // List databases
    const dbList = await admin.listDatabases();
    console.log(`\n📂 Available Databases (${dbList.databases.length}):`);
    dbList.databases.forEach(db => {
      console.log(`  • ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    await client.close();
    console.log('\n🎉 Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.error('\n💡 Authentication failed. Check:');
      console.error('  • Username is correct');
      console.error('  • Password is correct');
      console.error('  • User has proper permissions');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Network error. Check:');
      console.error('  • Internet connection is active');
      console.error('  • MongoDB URI is correct');
      console.error('  • Cluster name is correct');
    }
    
    process.exit(1);
  }
}

testConnection();
