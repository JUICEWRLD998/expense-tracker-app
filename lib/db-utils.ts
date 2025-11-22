// Mock database utilities - replace with real database calls in production
export interface Expense {
  id: string
  userId: string
  title: string
  amount: number
  category: string
  date: string
  description?: string
}

export function getExpenses(userId: string): Expense[] {
  const expenses = localStorage.getItem(`expenses_${userId}`)
  return expenses ? JSON.parse(expenses) : []
}

export function addExpense(userId: string, expense: Omit<Expense, "id" | "userId">): Expense {
  const newExpense: Expense = {
    ...expense,
    id: Math.random().toString(36).substr(2, 9),
    userId,
  }

  const expenses = getExpenses(userId)
  expenses.push(newExpense)
  localStorage.setItem(`expenses_${userId}`, JSON.stringify(expenses))
  return newExpense
}

export function updateExpense(userId: string, id: string, updates: Partial<Expense>): Expense {
  const expenses = getExpenses(userId)
  const index = expenses.findIndex((e) => e.id === id)

  if (index === -1) throw new Error("Expense not found")

  expenses[index] = { ...expenses[index], ...updates }
  localStorage.setItem(`expenses_${userId}`, JSON.stringify(expenses))
  return expenses[index]
}

export function deleteExpense(userId: string, id: string): void {
  const expenses = getExpenses(userId)
  const filtered = expenses.filter((e) => e.id !== id)
  localStorage.setItem(`expenses_${userId}`, JSON.stringify(filtered))
}

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
