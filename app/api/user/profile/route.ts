import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { query } from "@/lib/db"

/**
 * Example protected route - Get current user profile
 * To use this endpoint, include the JWT token in the Authorization header:
 * Authorization: Bearer <your-jwt-token>
 */
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token and get user info
    const { userId } = getUserFromRequest(request)

    // Fetch user from database
    const result = await query("SELECT id, email, name, created_at FROM users WHERE id = $1", [
      userId,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = result.rows[0]

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Update user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify JWT token and get user info
    const { userId } = getUserFromRequest(request)

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Update user in database
    const result = await query(
      "UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name",
      [name, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Update user error:", error)
    
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
