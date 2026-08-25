// Vercel Serverless Function to handle guest data
import fs from 'fs';
import path from 'path';

// Use /tmp directory (writable in Vercel)
const guestsFilePath = path.join('/tmp', 'guests.json');

// Ensure the guests file exists
function ensureGuestsFile() {
  try {
    if (!fs.existsSync(guestsFilePath)) {
      // Initialize with data from public/guests.json if available
      const publicPath = path.join(process.cwd(), 'public', 'guests.json');
      if (fs.existsSync(publicPath)) {
        const initialData = fs.readFileSync(publicPath, 'utf8');
        fs.writeFileSync(guestsFilePath, initialData);
      } else {
        fs.writeFileSync(guestsFilePath, JSON.stringify([], null, 2));
      }
    }
  } catch (error) {
    console.error('Error ensuring guests file:', error);
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  ensureGuestsFile();

  try {
    if (req.method === 'GET') {
      // Read and return guests
      const data = fs.readFileSync(guestsFilePath, 'utf8');
      const guests = JSON.parse(data);
      return res.status(200).json(guests);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Save guests data
      const guests = req.body;
      
      if (!Array.isArray(guests)) {
        return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
      }

      fs.writeFileSync(guestsFilePath, JSON.stringify(guests, null, 2));
      return res.status(200).json({ success: true, count: guests.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
