"use client"

import type { Expense } from "@/lib/db-utils"

interface CategoryBreakdownProps {
  expenses: Expense[]
}

export default function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  const categoryTotals = expenses.reduce(
    (acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount)
      return acc
    },
    {} as Record<string, number>,
  )

  const totalAmount = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-text mb-4">Spending by Category</h3>
      <div className="space-y-3">
        {sortedCategories.map(([category, amount]) => {
          const percentage = (amount / totalAmount) * 100
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text">{category}</span>
                <span className="text-sm text-text-muted">
                  ₦{Number(amount).toFixed(2)} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
