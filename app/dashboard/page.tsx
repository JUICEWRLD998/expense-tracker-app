"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { type Expense, getExpenses, addExpense } from "@/lib/db-utils"
import ExpenseList from "@/components/expense-list"
import ExpenseSummary from "@/components/expense-summary"
import ExpenseFilters from "@/components/expense-filters"
import ExpenseForm from "@/components/expense-form"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Load expenses when component mounts or user changes
  useEffect(() => {
    if (user) {
      const allExpenses = getExpenses(user.id)
      setExpenses(allExpenses)
      setFilteredExpenses(allExpenses)
    }
  }, [user])

  const handleAddExpense = (data: Omit<Expense, "id" | "userId">) => {
    if (user) {
      addExpense(user.id, data)
      handleExpensesUpdate()
    }
  }

  const handleExpensesUpdate = () => {
    if (user) {
      const allExpenses = getExpenses(user.id)
      setExpenses(allExpenses)
      // Reapply filters
      applyFilters(allExpenses, selectedCategory, dateRange.start, dateRange.end)
      setShowAddForm(false)
    }
  }

  const applyFilters = (expenseList: Expense[], category: string, start: string, end: string) => {
    let filtered = expenseList

    if (category) {
      filtered = filtered.filter((e) => e.category === category)
    }

    if (start) {
      filtered = filtered.filter((e) => new Date(e.date) >= new Date(start))
    }

    if (end) {
      filtered = filtered.filter((e) => new Date(e.date) <= new Date(end))
    }

    setFilteredExpenses(filtered)
  }

  const handleFilterChange = (category: string, start: string, end: string) => {
    setSelectedCategory(category)
    setDateRange({ start, end })
    applyFilters(expenses, category, start, end)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-primary-dark hover:bg-opacity-80 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <ExpenseSummary expenses={filteredExpenses} />

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text">Expenses</h2>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            {showAddForm ? "Cancel" : "+ Add Expense"}
          </Button>
        </div>

        {/* Add Expense Form */}
        {showAddForm && (
          <div className="mt-6 card">
            <h3 className="text-lg font-semibold text-text mb-4">Add New Expense</h3>
            <ExpenseForm onSubmit={handleAddExpense} onCancel={() => setShowAddForm(false)} submitLabel="Add Expense" />
          </div>
        )}

        {/* Filters */}
        <ExpenseFilters onFilterChange={handleFilterChange} />

        {/* Expense List */}
        <ExpenseList expenses={filteredExpenses} onExpenseUpdate={handleExpensesUpdate} userId={user.id} />
      </main>
    </div>
  )
}
