"use client"

import { type Expense } from "@/lib/db-utils"
import { useState } from "react"
import ExpenseItem from "./expense-item"

interface ExpenseListProps {
  expenses: Expense[]
  onExpenseUpdate: () => void
}

export default function ExpenseList({ expenses, onExpenseUpdate }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onExpenseUpdate()
      }
    } catch (error) {
      console.error("Failed to delete expense:", error)
    } finally {
      setDeletingId(null)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="mt-8 card text-center text-text-muted py-12">
        <p>No expenses found. Add your first expense to get started!</p>
      </div>
    )
  }

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="mt-8 space-y-3">
      {sortedExpenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={() => handleDelete(expense.id)}
          onUpdate={onExpenseUpdate}
          isDeleting={deletingId === expense.id}
        />
      ))}
    </div>
  )
}
