"use client"

import { useState } from "react"
import { CATEGORIES } from "@/lib/db-utils"
import { Button } from "@/components/ui/button"

interface BudgetFormProps {
  initialData?: {
    category?: string
    amount?: number
  }
  onSubmit: (data: { category: string; amount: number }) => void
  onCancel?: () => void
  submitLabel?: string
  disableCategory?: boolean
}

export default function BudgetForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save Budget",
  disableCategory = false,
}: BudgetFormProps) {
  const [category, setCategory] = useState(initialData?.category || "")
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!category) {
      setError("Please select a category")
      return
    }

    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount greater than 0")
      return
    }

    setLoading(true)
    try {
      onSubmit({
        category,
        amount: Number.parseFloat(amount),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Category *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={disableCategory || loading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Monthly Budget Amount *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={loading}
            className="flex h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm disabled:opacity-50"
          />
        </div>
      </div>

      {error && <div className="text-destructive text-sm">{error}</div>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline" disabled={loading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
