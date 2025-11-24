"use client"

import { type Expense } from "@/lib/db-utils"
import { useState } from "react"
import ExpenseForm from "./expense-form"
import { Button } from "@/components/ui/button"

interface ExpenseItemProps {
  expense: Expense
  onDelete: () => void
  onUpdate: () => void
  isDeleting: boolean
}

export default function ExpenseItem({ expense, onDelete, onUpdate, isDeleting }: ExpenseItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdate = async (updates: Omit<Expense, "id" | "userId">) => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        onUpdate()
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Failed to update expense:", error)
    }
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
            <h3 className="font-semibold">{expense.title}</h3>
            <p className="text-sm text-muted-foreground">
              {expense.category} • {new Date(expense.date).toLocaleDateString()}
            </p>
            {expense.description && <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xl font-bold text-primary">${Number(expense.amount).toFixed(2)}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            Edit
          </Button>
          <Button
            onClick={onDelete}
            disabled={isDeleting}
            variant="destructive"
            size="sm"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}
