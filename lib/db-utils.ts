// Database expense interface
export interface Expense {
  id: number
  user_id: number
  title: string
  amount: number
  category: string
  date: string
  description?: string
  created_at?: string
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

// Database budget interface
export interface Budget {
  id: number
  user_id: number
  category: string
  amount: number
  month: number
  year: number
  created_at?: string
  updated_at?: string
}
