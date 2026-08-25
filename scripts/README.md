# MongoDB Setup Scripts

## Available Scripts

### 1. Test Connection
Tests your MongoDB connection to verify credentials work.

```bash
npm run test:mongodb
```

**What it does:**
- ✅ Verifies MongoDB URI is correct
- ✅ Tests authentication (username/password)
- ✅ Shows MongoDB server version
- ✅ Lists available databases

**When to use:**
- Before setting up the database
- After changing credentials
- When troubleshooting connection issues

---

### 2. Setup MongoDB
Creates the database, collection, and indexes automatically.

```bash
npm run setup:mongodb
```

**What it does:**
- ✅ Creates `wedding` database
- ✅ Creates `guests` collection
- ✅ Adds 4 indexes for performance:
  - Unique index on `id` (prevents duplicates)
  - Index on `registeredAt` (for sorting)
  - Index on `email` (for searching)
  - Index on `attending` (for filtering)
- ✅ Inserts a sample guest (if collection is empty)
- ✅ Shows collection statistics

**When to use:**
- Initial project setup (run once)
- After creating a new MongoDB cluster
- When resetting the database

**Note:** Safe to run multiple times - won't duplicate indexes or collections.

---

## Quick Start

1. **Test connection first:**
   ```bash
   npm run test:mongodb
   ```

2. **If connection succeeds, setup database:**
   ```bash
   npm run setup:mongodb
   ```

3. **Done!** Your database is ready for the RSVP app.

---

## Environment Variables

Make sure `.env` file contains:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=wedding
```

---

## Database Structure

After setup, you'll have:

**Database:** `wedding`

**Collection:** `guests`

**Indexes:**
1. `_id_` - Default MongoDB index
2. `id_1` - Unique index on custom ID field
3. `registeredAt_-1` - Descending index for sorting
4. `email_1` - Index for email lookups
5. `attending_1` - Index for filtering by attendance

**Sample Document:**
```json
{
  "_id": ObjectId("..."),
  "id": "sample_1724567890123",
  "name": "Sample Guest",
  "email": "sample@example.com",
  "phone": "+1234567890",
  "attending": "yes",
  "guestCount": 1,
  "dietaryRestrictions": "",
  "message": "This is a sample entry - you can delete it from the admin panel",
  "registeredAt": "2026-08-25T10:30:00.000Z"
}
```

---

## Troubleshooting

### "MONGODB_URI not found"
**Solution:** Create `.env` file in project root with your credentials

### "bad auth" error
**Solution:** 
- Check username and password are correct
- Ensure no typos in credentials
- Verify user exists in MongoDB Atlas (Database Access)

### "ENOTFOUND" or "Network error"
**Solution:**
- Check internet connection
- Verify cluster URL is correct
- Ensure IP is whitelisted in MongoDB Atlas (Network Access)

### "Index already exists"
**Solution:** Safe to ignore - indexes won't be duplicated

---

## Manual Verification

To verify setup in MongoDB Atlas:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Browse Collections"
3. You should see:
   - Database: `wedding`
   - Collection: `guests`
   - 1 sample document (if inserted)

---

## Cleanup (Optional)

To remove the sample document:
1. Use the admin panel in your app, OR
2. In MongoDB Atlas: Browse Collections → Delete the sample entry

---

## For Vercel Deployment

After running setup locally:

1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Add:
   - **Name:** `MONGODB_URI`
   - **Value:** Your full connection string
   - **Environments:** Production, Preview, Development
4. Redeploy your app

Your Vercel functions will use the same database! 🎉
