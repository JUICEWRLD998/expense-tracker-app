import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production"

interface JwtPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

/**
 * Verify JWT token and return decoded payload
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    return decoded
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

/**
 * Get user from request authorization header
 * Usage: const user = await getUserFromRequest(request)
 */
export function getUserFromRequest(request: NextRequest): JwtPayload {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No authorization token provided")
  }

  const token = authHeader.substring(7) // Remove "Bearer " prefix
  return verifyToken(token)
}

/**
 * Get user from token in cookies (alternative method)
 */
export function getUserFromCookies(request: NextRequest): JwtPayload {
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    throw new Error("No authentication token found")
  }

  return verifyToken(token)
}
