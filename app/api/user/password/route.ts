import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { getUserFromRequest } from "@/lib/auth-utils"
import { query } from "@/lib/db"

/**
 * Change user password
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify JWT token and get user info
    const { userId } = getUserFromRequest(request)

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
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

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password in database
    await query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newPasswordHash, userId]
    )

    return NextResponse.json({
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)

    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
