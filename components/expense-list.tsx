"use client"

import { type Expense, deleteExpense } from "@/lib/db-utils"
import { useState } from "react"
import ExpenseItem from "./expense-item"

interface ExpenseListProps {
  expenses: Expense[]
  onExpenseUpdate: () => void
  userId: string
}

export default function ExpenseList({ expenses, onExpenseUpdate, userId }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setDeletingId(id)
    try {
      deleteExpense(userId, id)
      onExpenseUpdate()
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
          userId={userId}
          isDeleting={deletingId === expense.id}
        />
      ))}
    </div>
  )
}
