// Vercel Serverless Function to handle guest data via MongoDB
import { MongoClient } from 'mongodb';

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'wedding';
const COLLECTION_NAME = 'guests';

// Cached connection for reuse across invocations
let cachedClient = null;
let cachedDb = null;

// Connect to MongoDB with connection pooling
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not configured');
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Fetch all guests from MongoDB
async function fetchGuests() {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const guests = await collection
    .find({})
    .sort({ registeredAt: -1 })
    .toArray();
  
  // Convert MongoDB _id to string and remove it from response
  return guests.map(guest => {
    const { _id, ...guestData } = guest;
    return guestData;
  });
}

// Save or update a guest in MongoDB
async function saveGuest(guest) {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  // Upsert: update if exists (by id), insert if new
  await collection.updateOne(
    { id: guest.id },
    { $set: guest },
    { upsert: true }
  );
  
  return guest;
}

// Delete a guest from MongoDB
async function deleteGuest(guestId) {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const result = await collection.deleteOne({ id: guestId });
  return result.deletedCount > 0;
}

// Clear all guests from MongoDB
async function clearAllGuests() {
  const { db } = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);
  
  const result = await collection.deleteMany({});
  return result.deletedCount;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if MongoDB is configured
  if (!MONGODB_URI) {
    return res.status(500).json({
      error: 'MongoDB not configured. Please set MONGODB_URI environment variable.',
    });
  }

  try {
    if (req.method === 'GET') {
      // Fetch and return all guests
      const guests = await fetchGuests();
      return res.status(200).json(guests);
    }

    if (req.method === 'POST') {
      // Save a single guest
      const guest = req.body;
      
      if (!guest || !guest.id) {
        return res.status(400).json({ error: 'Invalid guest data' });
      }

      const savedGuest = await saveGuest(guest);
      return res.status(200).json({ success: true, guest: savedGuest });
    }

    if (req.method === 'DELETE') {
      // Delete a guest by ID
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Guest ID required' });
      }

      const deleted = await deleteGuest(id);
      return res.status(200).json({ success: deleted });
    }

    if (req.method === 'PUT' && req.query.action === 'clear') {
      // Clear all guests (admin action)
      const count = await clearAllGuests();
      return res.status(200).json({ success: true, deletedCount: count });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
