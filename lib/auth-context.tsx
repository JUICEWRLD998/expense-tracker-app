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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signup = async (email: string, password: string, name: string) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}")

    if (users[email]) {
      throw new Error("User already exists")
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password: btoa(password), // Simple base64 encoding for demo
      name,
    }

    users[email] = newUser
    localStorage.setItem("users", JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword))
  }

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}")
    const user = users[email]

    if (!user || user.password !== btoa(password)) {
      throw new Error("Invalid email or password")
    }

    const { password: _, ...userWithoutPassword } = user
    setUser(userWithoutPassword)
    localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
  }

  return <AuthContext.Provider value={{ user, loading, signup, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
