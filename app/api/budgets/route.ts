import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth-utils"

// GET /api/budgets - Get all budgets for authenticated user (optionally filter by month/year)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get optional month/year query params
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    let sql = "SELECT * FROM budgets WHERE user_id = $1"
    const params: (string | number)[] = [decoded.userId]

    if (month && year) {
      sql += " AND month = $2 AND year = $3"
      params.push(parseInt(month), parseInt(year))
    }

    sql += " ORDER BY category ASC"

    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    )
  }
}

// POST /api/budgets - Create new budget
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { category, amount, month, year } = body

    // Validate input
    if (!category || !amount || !month || !year) {
      return NextResponse.json(
        { error: "Category, amount, month, and year are required" },
        { status: 400 }
      )
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Month must be between 1 and 12" },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    // Check if budget already exists for this category/month/year
    const existing = await query(
      "SELECT id FROM budgets WHERE user_id = $1 AND category = $2 AND month = $3 AND year = $4",
      [decoded.userId, category, month, year]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Budget already exists for this category in this month" },
        { status: 409 }
      )
    }

    // Insert budget
    const result = await query(
      `INSERT INTO budgets (user_id, category, amount, month, year)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [decoded.userId, category, amount, month, year]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Error creating budget:", error)
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    )
  }
}
