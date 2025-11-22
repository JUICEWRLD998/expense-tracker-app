"use client"

import { type Expense, updateExpense } from "@/lib/db-utils"
import { useState } from "react"
import ExpenseForm from "./expense-form"
import { Button } from "@/components/ui/button"

interface ExpenseItemProps {
  expense: Expense
  onDelete: () => void
  onUpdate: () => void
  userId: string
  isDeleting: boolean
}

export default function ExpenseItem({ expense, onDelete, onUpdate, userId, isDeleting }: ExpenseItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdate = (updates: Partial<Expense>) => {
    updateExpense(userId, expense.id, updates)
    onUpdate()
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="card bg-background">
        <ExpenseForm
          initialData={expense}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          submitLabel="Update Expense"
        />
      </div>
    )
  }

  return (
    <div className="card flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div>
            <h3 className="font-semibold text-text">{expense.title}</h3>
            <p className="text-sm text-text-muted">
              {expense.category} • {new Date(expense.date).toLocaleDateString()}
            </p>
            {expense.description && <p className="text-sm text-text-muted mt-1">{expense.description}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xl font-bold text-primary">${expense.amount.toFixed(2)}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditing(true)} className="btn-secondary text-sm">
            Edit
          </Button>
          <Button
            onClick={onDelete}
            disabled={isDeleting}
            className="text-sm bg-danger hover:bg-opacity-80 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}
