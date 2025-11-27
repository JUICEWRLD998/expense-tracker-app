import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth-utils"

// PUT /api/budgets/[id] - Update budget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    // Check if budget exists and belongs to user
    const checkResult = await query(
      "SELECT * FROM budgets WHERE id = $1 AND user_id = $2",
      [id, decoded.userId]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Budget not found or unauthorized" },
        { status: 404 }
      )
    }

    // Update budget amount
    const result = await query(
      `UPDATE budgets SET amount = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [amount, id, decoded.userId]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error updating budget:", error)
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 }
    )
  }
}

// DELETE /api/budgets/[id] - Delete budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Delete budget (only if belongs to user)
    const result = await query(
      "DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, decoded.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Budget not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Budget deleted successfully" })
  } catch (error) {
    console.error("Error deleting budget:", error)
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    )
  }
}
