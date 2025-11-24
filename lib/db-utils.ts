// Database utilities for expense management
export interface Expense {
  id: number
  user_id: number
  amount: number
  category: string
  date: string
  description?: string
  created_at?: string
  updated_at?: string
}

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem("token")
}

// Fetch all expenses for the current user
export async function getExpenses(): Promise<Expense[]> {
  const token = getAuthToken()
  if (!token) {
    throw new Error("No authentication token found")
  }

  const response = await fetch("/api/expenses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch expenses")
  }

  const data = await response.json()
  return data.expenses
}

// Add a new expense
export async function addExpense(
  expense: Omit<Expense, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Expense> {
  const token = getAuthToken()
  if (!token) {
    throw new Error("No authentication token found")
  }

  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expense),
  })

  if (!response.ok) {
    throw new Error("Failed to add expense")
  }

  const data = await response.json()
  return data.expense
}

// Update an existing expense
export async function updateExpense(
  id: number,
  updates: Partial<Omit<Expense, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<Expense> {
  const token = getAuthToken()
  if (!token) {
    throw new Error("No authentication token found")
  }

  const response = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error("Failed to update expense")
  }

  const data = await response.json()
  return data.expense
}

// Delete an expense
export async function deleteExpense(id: number): Promise<void> {
  const token = getAuthToken()
  if (!token) {
    throw new Error("No authentication token found")
  }

  const response = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete expense")
  }
}

// Available expense categories
export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Other",
]

export const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Education",
  "Other",
]
