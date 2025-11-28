import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { getUserFromRequest } from "@/lib/auth-utils"
import { query } from "@/lib/db"

/**
 * Delete user account and all associated data
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify JWT token and get user info
    const { userId } = getUserFromRequest(request)

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to delete account" },
        { status: 400 }
      )
    }

    // Get current user with password hash
    const userResult = await query(
      "SELECT id, password_hash FROM users WHERE id = $1",
      [userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Password is incorrect" },
        { status: 400 }
      )
    }

    // Delete all user data (cascading delete)
    // Delete expenses first
    await query("DELETE FROM expenses WHERE user_id = $1", [userId])
    
    // Delete budgets
    await query("DELETE FROM budgets WHERE user_id = $1", [userId])
    
    // Delete the user
    await query("DELETE FROM users WHERE id = $1", [userId])

    return NextResponse.json({
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("Delete account error:", error)

    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
