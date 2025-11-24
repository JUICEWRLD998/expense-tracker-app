# Expense Tracker API Documentation

## Overview
The Expense Tracker now uses PostgreSQL database to store all user expenses. Each user's expenses are securely stored and associated with their user ID.

## Database Setup
Make sure you've already run the database schema from `database/schema.sql`. The `expenses` table structure:

```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

All expense endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### 1. Get All Expenses
**GET** `/api/expenses`

Retrieves all expenses for the authenticated user, ordered by date (newest first).

**Response:**
```json
{
  "expenses": [
    {
      "id": 1,
      "user_id": 5,
      "amount": 50.00,
      "category": "Food",
      "description": "Grocery shopping",
      "date": "2025-11-24",
      "created_at": "2025-11-24T10:30:00Z",
      "updated_at": "2025-11-24T10:30:00Z"
    }
  ]
}
```

### 2. Create Expense
**POST** `/api/expenses`

Creates a new expense for the authenticated user.

**Request Body:**
```json
{
  "amount": 50.00,
  "category": "Food",
  "description": "Grocery shopping",
  "date": "2025-11-24"
}
```

**Required Fields:**
- `amount` (number): Must be greater than 0
- `category` (string): One of: Food, Transport, Shopping, Entertainment, Utilities, Healthcare, Other
- `date` (string): ISO date format (YYYY-MM-DD)

**Optional Fields:**
- `description` (string): Additional notes about the expense

**Response:**
```json
{
  "expense": {
    "id": 1,
    "user_id": 5,
    "amount": 50.00,
    "category": "Food",
    "description": "Grocery shopping",
    "date": "2025-11-24",
    "created_at": "2025-11-24T10:30:00Z",
    "updated_at": "2025-11-24T10:30:00Z"
  }
}
```

### 3. Update Expense
**PUT** `/api/expenses/[id]`

Updates an existing expense. Users can only update their own expenses.

**Request Body:**
```json
{
  "amount": 75.00,
  "category": "Shopping",
  "description": "Updated description",
  "date": "2025-11-24"
}
```

**Response:**
```json
{
  "expense": {
    "id": 1,
    "user_id": 5,
    "amount": 75.00,
    "category": "Shopping",
    "description": "Updated description",
    "date": "2025-11-24",
    "created_at": "2025-11-24T10:30:00Z",
    "updated_at": "2025-11-24T15:45:00Z"
  }
}
```

### 4. Delete Expense
**DELETE** `/api/expenses/[id]`

Deletes an expense. Users can only delete their own expenses.

**Response:**
```json
{
  "message": "Expense deleted successfully"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
or
```json
{
  "error": "Invalid token"
}
```

### 400 Bad Request
```json
{
  "error": "Amount, category, and date are required"
}
```

### 404 Not Found
```json
{
  "error": "Expense not found or unauthorized"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch expenses"
}
```

## Frontend Integration

The frontend uses `lib/db-utils.ts` which provides helper functions:

### getExpenses()
```typescript
const expenses = await getExpenses()
```

### addExpense(data)
```typescript
await addExpense({
  amount: 50.00,
  category: "Food",
  description: "Grocery shopping",
  date: "2025-11-24"
})
```

### updateExpense(id, updates)
```typescript
await updateExpense(1, {
  amount: 75.00,
  category: "Shopping"
})
```

### deleteExpense(id)
```typescript
await deleteExpense(1)
```

## Security Features

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **User Isolation**: Users can only access their own expenses
3. **SQL Injection Protection**: Uses parameterized queries
4. **Cascade Deletion**: When a user is deleted, all their expenses are automatically removed

## Testing the API

You can test the API using curl or any API client:

```bash
# Get all expenses
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/expenses

# Create expense
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
  -d '{"amount":50,"category":"Food","description":"Lunch","date":"2025-11-24"}' \
  http://localhost:3000/api/expenses

# Update expense
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
  -d '{"amount":60,"category":"Food","description":"Updated lunch","date":"2025-11-24"}' \
  http://localhost:3000/api/expenses/1

# Delete expense
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/expenses/1
```

## Database Queries Used

The API uses efficient queries with proper indexing:

- **user_id index**: Fast lookup of user expenses
- **date index**: Efficient filtering by date ranges
- **category index**: Quick category-based queries

All queries are optimized for performance with proper indexes defined in the schema.
