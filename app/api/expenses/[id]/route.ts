import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth-utils"

// PUT /api/expenses/[id] - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { amount, category, description, date } = body

    // Check if expense exists and belongs to user
    const checkResult = await query(
      "SELECT * FROM expenses WHERE id = $1 AND user_id = $2",
      [params.id, decoded.userId]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Expense not found or unauthorized" },
        { status: 404 }
      )
    }

    // Update expense
    const result = await query(
      `UPDATE expenses 
       SET amount = $1, category = $2, description = $3, date = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [amount, category, description || null, date, params.id, decoded.userId]
    )

    return NextResponse.json({ expense: result.rows[0] })
  } catch (error) {
    console.error("Error updating expense:", error)
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    )
  }
}

// DELETE /api/expenses/[id] - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Delete expense (only if belongs to user)
    const result = await query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *",
      [params.id, decoded.userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Expense not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    )
  }
}
