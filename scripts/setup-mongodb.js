// MongoDB Setup Script
// This script creates the database and collection with proper indexes
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'wedding';
const COLLECTION_NAME = 'guests';

async function setupMongoDB() {
  console.log('🚀 Starting MongoDB setup...\n');

  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI not found in .env file');
    process.exit(1);
  }

  let client;

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB Atlas...');
    client = await MongoClient.connect(MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    // Get database
    const db = client.db(DB_NAME);
    console.log(`📂 Using database: ${DB_NAME}`);

    // Check if collection exists
    const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
    
    if (collections.length > 0) {
      console.log(`✅ Collection '${COLLECTION_NAME}' already exists`);
    } else {
      // Create collection
      await db.createCollection(COLLECTION_NAME);
      console.log(`✅ Created collection: ${COLLECTION_NAME}`);
    }

    const collection = db.collection(COLLECTION_NAME);

    // Create indexes for performance
    console.log('\n🔧 Creating indexes...');

    // Unique index on 'id' field
    await collection.createIndex({ id: 1 }, { unique: true });
    console.log('  ✓ Unique index on "id" field');

    // Index on registeredAt for sorting
    await collection.createIndex({ registeredAt: -1 });
    console.log('  ✓ Index on "registeredAt" field (descending)');

    // Index on email for searching
    await collection.createIndex({ email: 1 });
    console.log('  ✓ Index on "email" field');

    // Index on attending for filtering
    await collection.createIndex({ attending: 1 });
    console.log('  ✓ Index on "attending" field');

    // Get collection stats
    const stats = await db.command({ collStats: COLLECTION_NAME });
    const count = await collection.countDocuments();

    console.log('\n📊 Collection Statistics:');
    console.log(`  • Database: ${DB_NAME}`);
    console.log(`  • Collection: ${COLLECTION_NAME}`);
    console.log(`  • Documents: ${count}`);
    console.log(`  • Indexes: ${stats.nindexes}`);
    console.log(`  • Storage Size: ${(stats.size / 1024).toFixed(2)} KB`);

    // Insert sample document if collection is empty (optional)
    if (count === 0) {
      console.log('\n📝 Collection is empty. Adding sample document...');
      const sampleGuest = {
        id: 'sample_' + Date.now(),
        name: 'Sample Guest',
        email: 'sample@example.com',
        phone: '+1234567890',
        attending: 'yes',
        guestCount: 1,
        dietaryRestrictions: '',
        message: 'This is a sample entry - you can delete it from the admin panel',
        registeredAt: new Date().toISOString(),
      };

      await collection.insertOne(sampleGuest);
      console.log('✅ Sample document inserted');
    }

    console.log('\n🎉 MongoDB setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Add MONGODB_URI to Vercel environment variables');
    console.log('  2. Deploy your app to Vercel');
    console.log('  3. Test the RSVP form');
    console.log('\n✨ Your database is ready to use!\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.error('\n💡 Tip: Check your username and password in .env file');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 Tip: Check your internet connection and MongoDB URI');
    } else if (error.code === 11000) {
      console.error('\n💡 Tip: Duplicate key error - indexes may already exist');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

// Run the setup
setupMongoDB();
