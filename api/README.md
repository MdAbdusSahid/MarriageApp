# Wedding RSVP API

This Vercel serverless function handles guest data storage using MongoDB Atlas.

## Endpoints

### GET /api/guests
Fetches all guests from MongoDB.

**Response:**
```json
[
  {
    "id": "1234567890abc",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "attending": "yes",
    "guestCount": 2,
    "dietaryRestrictions": "Vegetarian",
    "message": "Looking forward to it!",
    "registeredAt": "2026-08-25T10:30:00.000Z"
  }
]
```

### POST /api/guests
Saves a single guest to MongoDB.

**Request Body:**
```json
{
  "id": "1234567890abc",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "attending": "yes",
  "guestCount": 2,
  "dietaryRestrictions": "Vegetarian",
  "message": "Looking forward to it!",
  "registeredAt": "2026-08-25T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "guest": { ... }
}
```

### DELETE /api/guests?id={guestId}
Deletes a single guest from MongoDB.

**Response:**
```json
{
  "success": true
}
```

### PUT /api/guests?action=clear
Clears all guests from MongoDB (admin action).

**Response:**
```json
{
  "success": true,
  "deletedCount": 42
}
```

## Configuration

Required environment variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `DB_NAME` - Database name (optional, defaults to 'wedding')

See [MONGODB_SETUP.md](../MONGODB_SETUP.md) for setup instructions.

## MongoDB Structure

**Database**: `wedding`  
**Collection**: `guests`

Document schema:
```json
{
  "_id": ObjectId("..."),
  "id": "unique_guest_id",
  "name": "Guest Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "attending": "yes|no",
  "guestCount": 2,
  "dietaryRestrictions": "Vegetarian",
  "message": "Message text",
  "registeredAt": "2026-08-25T10:30:00.000Z"
}
```

## How It Works

1. **Connection**: Uses MongoDB Node.js driver with connection pooling
2. **Fetch**: Queries MongoDB collection and returns sorted results
3. **Save**: Upserts documents (updates if exists, inserts if new)
4. **Delete**: Removes documents by ID
5. **Cache**: Frontend caches responses for 10 seconds to reduce API calls

## Local Development

1. Create `.env` file with your credentials:
   ```
   MONGODB_URI=mongodb+srv://...
   DB_NAME=wedding
   ```

2. Run: `vercel dev`
3. Test at: `http://localhost:3000/api/guests`

## Security

- MongoDB connection uses TLS encryption
- Connection string stored securely in environment variables
- CORS enabled for all origins (adjust if needed for production)
- No authentication on API endpoints (add if needed)

## Error Handling

- Returns 500 if MongoDB not configured
- Returns 400 for invalid guest data
- Returns 404 for guest not found on delete
- Falls back to cached data on network errors (frontend)
- Connection pooling prevents timeout issues

## Performance

- Connection pooling (10 max, 2 min connections)
- Cached client reused across function invocations
- Frontend caching reduces database queries
- Indexed queries for fast retrieval
