# PostgreSQL Database Setup Guide

This guide will walk you through setting up PostgreSQL for the Expense Tracker application with user authentication.

## Prerequisites

- PostgreSQL installed on your system
- Node.js and npm installed

---

## Step 1: Install PostgreSQL

### Windows

1. **Download PostgreSQL**
   - Go to [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   - Download the PostgreSQL installer (recommended version 14 or higher)

2. **Run the Installer**
   - Launch the installer
   - Keep the default installation directory
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Set a password for the `postgres` superuser (remember this!)
   - Use default port: `5432`
   - Complete the installation

3. **Verify Installation**
   ```powershell
   psql --version
   ```

### macOS

```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## Step 2: Create the Database

### Option 1: Using pgAdmin (GUI)

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to your PostgreSQL server (enter the password you set during installation)
3. Right-click on **Databases** → **Create** → **Database**
4. Enter database name: `expense_tracker`
5. Click **Save**

### Option 2: Using Command Line (psql)

**Windows (Command Prompt or PowerShell):**
```powershell
# Connect to PostgreSQL as postgres user
psql -U postgres

# Inside psql, create the database
CREATE DATABASE expense_tracker;

# Exit psql
\q
```

**macOS/Linux:**
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create the database
CREATE DATABASE expense_tracker;

# Exit
\q
```

---

## Step 3: Run the Database Schema

The schema file is located at `database/schema.sql`. This creates the users table and indexes.

### Option 1: Using psql Command Line

**Windows:**
```powershell
# Navigate to your project directory
cd C:\Users\fadhm\OneDrive\Desktop\expense-tracker-app

# Run the schema file
psql -U postgres -d expense_tracker -f database\schema.sql
```

**macOS/Linux:**
```bash
# Navigate to your project directory
cd /path/to/expense-tracker-app

# Run the schema file
psql -U postgres -d expense_tracker -f database/schema.sql
```

### Option 2: Using pgAdmin

1. Open **pgAdmin 4**
2. Navigate to: **Servers** → **PostgreSQL** → **Databases** → **expense_tracker**
3. Click **Tools** → **Query Tool**
4. Open the `database/schema.sql` file
5. Click the **Execute** button (▶️ icon)

### Option 3: Copy-Paste into psql

```powershell
# Connect to the expense_tracker database
psql -U postgres -d expense_tracker

# Paste the contents of schema.sql and press Enter
```

---

## Step 4: Configure Environment Variables

1. **Create `.env.local` file** in your project root (if not already created)

2. **Add the following configuration:**

```env
# PostgreSQL Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_tracker

# JWT Secret (generate a secure random string for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

3. **Update the values:**
   - Replace `YOUR_PASSWORD` with the password you set for the `postgres` user
   - Replace `JWT_SECRET` with a strong random string (for production, use a cryptographically secure random string)

### Generate a Secure JWT Secret

**Option 1: Using Node.js**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option 2: Using OpenSSL**
```bash
openssl rand -base64 64
```

---

## Step 5: Verify Database Connection

Create a test script to verify your database connection works:

```powershell
# In your project directory, create a test file
node -e "require('./lib/db').query('SELECT NOW()').then(() => console.log('✅ Database connected!')).catch(err => console.error('❌ Error:', err))"
```

If successful, you should see: `✅ Database connected!`

---

## Step 6: Test the Authentication

1. **Start your development server:**
   ```powershell
   npm run dev
   ```

2. **Test Signup:**
   - Navigate to `http://localhost:3000/signup`
   - Create a new account with:
     - Name: Test User
     - Email: test@example.com
     - Password: password123
   - You should be redirected to the dashboard

3. **Verify in Database:**
   ```powershell
   psql -U postgres -d expense_tracker -c "SELECT id, email, name, created_at FROM users;"
   ```
   You should see your newly created user!

4. **Test Login:**
   - Log out and go to `http://localhost:3000/login`
   - Login with the credentials you just created

---

## Database Schema Overview

### Users Table

| Column        | Type                      | Description                    |
|---------------|---------------------------|--------------------------------|
| id            | SERIAL PRIMARY KEY        | Auto-incrementing user ID      |
| email         | VARCHAR(255) UNIQUE       | User's email (unique)          |
| password_hash | VARCHAR(255)              | Bcrypt hashed password         |
| name          | VARCHAR(255)              | User's full name               |
| created_at    | TIMESTAMP WITH TIME ZONE  | Account creation timestamp     |
| updated_at    | TIMESTAMP WITH TIME ZONE  | Last update timestamp          |

### Expenses Table (Future Use)

| Column      | Type                      | Description                    |
|-------------|---------------------------|--------------------------------|
| id          | SERIAL PRIMARY KEY        | Auto-incrementing expense ID   |
| user_id     | INTEGER                   | References users(id)           |
| amount      | DECIMAL(10, 2)            | Expense amount                 |
| category    | VARCHAR(100)              | Expense category               |
| description | TEXT                      | Optional description           |
| date        | DATE                      | Expense date                   |
| created_at  | TIMESTAMP WITH TIME ZONE  | Creation timestamp             |
| updated_at  | TIMESTAMP WITH TIME ZONE  | Last update timestamp          |

---

## Common Issues and Solutions

### Issue 1: "psql: command not found"

**Solution:** Add PostgreSQL to your PATH

**Windows:**
1. Search for "Environment Variables" in Windows
2. Edit "Path" under System Variables
3. Add: `C:\Program Files\PostgreSQL\14\bin` (adjust version number)
4. Restart your terminal

### Issue 2: "password authentication failed for user postgres"

**Solution:** Reset the postgres password

```powershell
# Edit pg_hba.conf file and change "md5" to "trust" for local connections
# File location (Windows): C:\Program Files\PostgreSQL\14\data\pg_hba.conf
# Then restart PostgreSQL service and run:
psql -U postgres
ALTER USER postgres PASSWORD 'newpassword';
# Change back to "md5" in pg_hba.conf and restart service
```

### Issue 3: "Connection refused" or "ECONNREFUSED"

**Solution:** Ensure PostgreSQL is running

**Windows:**
```powershell
# Check if service is running
Get-Service postgresql*

# Start service if not running
Start-Service postgresql-x64-14
```

**macOS:**
```bash
brew services restart postgresql@14
```

**Linux:**
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Issue 4: Port 5432 is already in use

**Solution:** Either stop the other service using that port, or configure PostgreSQL to use a different port in `postgresql.conf`

---

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - It's already in `.gitignore`

2. **Use strong passwords**
   - For the postgres user
   - For the JWT secret

3. **In production:**
   - Use environment variables from your hosting provider
   - Enable SSL for database connections
   - Use a managed PostgreSQL service (e.g., AWS RDS, Heroku Postgres, DigitalOcean Managed Databases)

4. **Regular backups:**
   ```powershell
   # Backup database
   pg_dump -U postgres expense_tracker > backup.sql
   
   # Restore database
   psql -U postgres expense_tracker < backup.sql
   ```

---

## Next Steps

1. ✅ PostgreSQL installed and running
2. ✅ Database created
3. ✅ Schema applied
4. ✅ Environment variables configured
5. ✅ Authentication working

Now you're ready to:
- Add expense tracking features
- Create protected API routes
- Build the dashboard functionality

---

## Useful Commands

```powershell
# Connect to database
psql -U postgres -d expense_tracker

# List all tables
\dt

# Describe users table
\d users

# View all users
SELECT * FROM users;

# Count users
SELECT COUNT(*) FROM users;

# Delete a user (for testing)
DELETE FROM users WHERE email = 'test@example.com';

# Exit psql
\q
```

---

## Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
