"use client"

import type React from "react"

import { useState } from "react"
import { type Expense, CATEGORIES } from "@/lib/db-utils"
import { Button } from "@/components/ui/button"

interface ExpenseFormProps {
  initialData?: Expense
  onSubmit: (data: Omit<Expense, "id" | "userId">) => void
  onCancel: () => void
  submitLabel?: string
}

export default function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [category, setCategory] = useState(initialData?.category || "")
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0])
  const [description, setDescription] = useState(initialData?.description || "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!title.trim()) {
      setError("Title is required")
      return
    }
    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (!category) {
      setError("Please select a category")
      return
    }
    if (!date) {
      setError("Please select a date")
      return
    }

    setLoading(true)
    try {
      onSubmit({
        title: title.trim(),
        amount: Number.parseFloat(amount),
        category,
        date,
        description: description.trim(),
      } as any)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Grocery Shopping"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Amount *</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Date *</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional notes..."
          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
        />
      </div>

      {error && <div className="text-destructive text-sm">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  )
}
