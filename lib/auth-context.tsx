"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signup: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user and token from localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token")
      const storedUser = localStorage.getItem("auth_user")

      if (token && storedUser) {
        // Decode JWT payload and check expiry without a library
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          const isExpired = payload.exp && Date.now() / 1000 > payload.exp
          if (isExpired) {
            // Token expired — clear storage so user is redirected to login
            localStorage.removeItem("auth_token")
            localStorage.removeItem("auth_user")
          } else {
            setUser(JSON.parse(storedUser))
          }
        } catch {
          // Malformed token — clear it
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const signup = async (email: string, password: string, name: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Signup failed")
    }

    // Store token and user data
    localStorage.setItem("auth_token", data.token)
    localStorage.setItem("auth_user", JSON.stringify(data.user))
    setUser(data.user)
  }

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    // Store token and user data
    localStorage.setItem("auth_token", data.token)
    localStorage.setItem("auth_user", JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("auth_user", JSON.stringify(updatedUser))
  }

  return <AuthContext.Provider value={{ user, loading, signup, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
