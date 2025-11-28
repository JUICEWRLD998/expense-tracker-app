import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth-utils"
import { geminiModel, buildSystemPrompt, ExpenseContext } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { message, history } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Fetch user's expense data for context
    const expensesResult = await query(
      "SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC",
      [decoded.userId]
    )
    const expenses = expensesResult.rows

    // Fetch user's budgets for current month
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const budgetsResult = await query(
      "SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3",
      [decoded.userId, currentMonth, currentYear]
    )
    const budgets = budgetsResult.rows

    // Calculate context data
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)

    const thisMonthExpenses = expenses.filter((e: any) => {
      const d = new Date(e.date)
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
    })
    const thisMonthTotal = thisMonthExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)

    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear
    const lastMonthExpenses = expenses.filter((e: any) => {
      const d = new Date(e.date)
      return d.getMonth() + 1 === lastMonth && d.getFullYear() === lastMonthYear
    })
    const lastMonthTotal = lastMonthExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0)

    // Category breakdown for this month
    const categoryBreakdown: Record<string, number> = {}
    thisMonthExpenses.forEach((e: any) => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + Number(e.amount)
    })

    // Recent transactions
    const recentTransactions = expenses.slice(0, 10).map((e: any) => ({
      title: e.title,
      amount: Number(e.amount),
      category: e.category,
      date: new Date(e.date).toLocaleDateString(),
    }))

    // Budget status
    const budgetStatus = budgets.map((b: any) => ({
      category: b.category,
      amount: Number(b.amount),
      spent: categoryBreakdown[b.category] || 0,
    }))

    const context: ExpenseContext = {
      totalExpenses,
      thisMonthTotal,
      lastMonthTotal,
      categoryBreakdown,
      recentTransactions,
      budgets: budgetStatus,
    }

    // Build the prompt with context
    const systemPrompt = buildSystemPrompt(context)

    // Build conversation history for Gemini
    const chatHistory = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Start chat with history
    const chat = geminiModel.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm ready to help you with your expense tracking and financial questions. I have access to your spending data and can provide personalized insights. How can I assist you today?" }],
        },
        ...chatHistory,
      ],
    })

    // Send user message and get response
    const result = await chat.sendMessage(message)
    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    )
  }
}
