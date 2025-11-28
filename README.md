# Expense Tracker App

A modern expense tracking application built with Next.js, PostgreSQL, and Supabase.

## Features

- 📊 **Dashboard** - View spending overview with charts and statistics
- 💰 **Expense Management** - Add, edit, delete, and search expenses
- 🎯 **Budget Tracking** - Set monthly budgets per category and track progress
- 🤖 **AI Assistant** - Get financial insights using Google Gemini AI
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 💱 **Currency** - All amounts displayed in Nigerian Naira (₦)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (for database)
- Google Gemini API key (for AI features)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up your `.env.local` file:
   ```env
   DATABASE_URL=your_supabase_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign Up** - Create an account with email and password
2. **Add Expenses** - Click "Add Expense" to record your spending
3. **Set Budgets** - Go to Budgets page to set monthly limits per category
4. **View Analytics** - Check Dashboard for spending trends and category breakdown
5. **AI Insights** - Use AI Assistant to analyze spending patterns and get recommendations
6. **Settings** - Customize your profile, change password, or toggle dark mode

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT with bcrypt
- **Charts**: Recharts
- **AI**: Google Gemini API
- **Animations**: Framer Motion