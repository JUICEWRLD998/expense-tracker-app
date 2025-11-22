# Expense Tracker App - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### 1. Install Dependencies
```powershell
npm install
```

### 2. Install PostgreSQL
- **Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS:** `brew install postgresql@14`
- **Linux:** `sudo apt install postgresql`

### 3. Create Database
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE expense_tracker;

# Exit
\q
```

### 4. Run Database Schema
```powershell
psql -U postgres -d expense_tracker -f database\schema.sql
```

### 5. Configure Environment
Create `.env.local` file:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_tracker
JWT_SECRET=your-secret-key-here
```

### 6. Start Development Server
```powershell
npm run dev
```

### 7. Test Authentication
- Go to `http://localhost:3000/signup`
- Create an account
- You're ready! 🎉

---

## 📚 Full Documentation

For detailed setup instructions, troubleshooting, and best practices, see:
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete PostgreSQL setup guide

---

## 🔐 Authentication Features

- ✅ User signup with email & password
- ✅ Secure password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Protected API routes
- ✅ Persistent sessions

---

## 📁 Project Structure

```
expense-tracker-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # Login endpoint
│   │   │   └── signup/route.ts     # Signup endpoint
│   │   └── user/
│   │       └── profile/route.ts    # Protected user profile endpoint
│   ├── login/page.tsx              # Login page
│   ├── signup/page.tsx             # Signup page
│   └── dashboard/page.tsx          # Protected dashboard
├── lib/
│   ├── auth-context.tsx            # Auth context provider
│   ├── auth-utils.ts               # JWT verification utilities
│   ├── db.ts                       # PostgreSQL connection pool
│   └── db-utils.ts                 # Database utilities
├── database/
│   └── schema.sql                  # Database schema
├── .env.local                      # Environment variables (not in git)
└── DATABASE_SETUP.md               # Detailed setup guide
```

---

## 🔧 Available Scripts

```powershell
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **UI Components:** Radix UI, shadcn/ui

---

## 📝 Environment Variables

| Variable       | Description                          | Example                                        |
|----------------|--------------------------------------|------------------------------------------------|
| DATABASE_URL   | PostgreSQL connection string         | postgresql://postgres:pass@localhost:5432/db   |
| JWT_SECRET     | Secret key for JWT token signing     | your-super-secret-key                          |

---

## 🔒 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use strong JWT secrets** - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
3. **Change default passwords** - Update the postgres user password
4. **Use HTTPS in production** - Enable SSL for database connections

---

## 🐛 Troubleshooting

### Database connection fails?
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Start if not running
Start-Service postgresql-x64-14
```

### Port already in use?
```powershell
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Password authentication failed?
- Verify your password in `.env.local` matches your postgres password
- See DATABASE_SETUP.md for password reset instructions

---

## 📞 Need Help?

See **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for:
- Detailed PostgreSQL installation steps
- Common issues and solutions
- Database management commands
- Security best practices

---

## ✨ Next Steps

Once authentication is working:
1. Build expense tracking features
2. Add expense categories
3. Create charts and analytics
4. Export expense reports

Happy coding! 🚀
