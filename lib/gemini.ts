import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export interface ExpenseContext {
  totalExpenses: number
  thisMonthTotal: number
  lastMonthTotal: number
  categoryBreakdown: Record<string, number>
  recentTransactions: Array<{
    title: string
    amount: number
    category: string
    date: string
  }>
  budgets: Array<{
    category: string
    amount: number
    spent: number
  }>
}

export function buildSystemPrompt(context: ExpenseContext): string {
  const categoryList = Object.entries(context.categoryBreakdown)
    .map(([cat, amount]) => `  - ${cat}: $${amount.toFixed(2)}`)
    .join("\n")

  const recentList = context.recentTransactions
    .slice(0, 5)
    .map((t) => `  - ${t.title}: $${t.amount.toFixed(2)} (${t.category}, ${t.date})`)
    .join("\n")

  const budgetList = context.budgets
    .map((b) => {
      const remaining = b.amount - b.spent
      const status = remaining < 0 ? "OVER BUDGET" : remaining < b.amount * 0.2 ? "Near limit" : "On track"
      return `  - ${b.category}: $${b.spent.toFixed(2)} / $${b.amount.toFixed(2)} (${status})`
    })
    .join("\n")

  return `You are a helpful financial assistant for an expense tracking app. You help users understand their spending habits, provide budgeting advice, and answer questions about their finances.

Here is the user's current financial data:

**Overall Summary:**
- Total All-Time Expenses: $${context.totalExpenses.toFixed(2)}
- This Month's Spending: $${context.thisMonthTotal.toFixed(2)}
- Last Month's Spending: $${context.lastMonthTotal.toFixed(2)}
- Month-over-Month Change: ${context.lastMonthTotal > 0 ? (((context.thisMonthTotal - context.lastMonthTotal) / context.lastMonthTotal) * 100).toFixed(1) : 0}%

**Spending by Category (This Month):**
${categoryList || "  No expenses this month"}

**Recent Transactions:**
${recentList || "  No recent transactions"}

**Budget Status (This Month):**
${budgetList || "  No budgets set"}

Guidelines:
- Be friendly, concise, and helpful
- Provide specific insights based on their actual data
- Give actionable advice when asked
- Use dollar amounts from their data
- If they ask about something not in their data, let them know
- Format responses with markdown for better readability
- Keep responses focused and not too long`
}
