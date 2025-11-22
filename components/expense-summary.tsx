"use client"

import type { Expense } from "@/lib/db-utils"
import CategoryBreakdown from "./category-breakdown"

interface ExpenseSummaryProps {
  expenses: Expense[]
}

export default function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const avgAmount = expenses.length > 0 ? totalAmount / expenses.length : 0
  const maxAmount = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0

  const categoryTotals = expenses.reduce(
    (acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-primary text-white">
          <div className="text-sm font-medium opacity-90">Total Expenses</div>
          <div className="text-3xl font-bold mt-2">${totalAmount.toFixed(2)}</div>
          <div className="text-xs opacity-75 mt-2">{expenses.length} transactions</div>
        </div>

        <div className="card bg-success text-white">
          <div className="text-sm font-medium opacity-90">Average Expense</div>
          <div className="text-3xl font-bold mt-2">${avgAmount.toFixed(2)}</div>
          <div className="text-xs opacity-75 mt-2">per transaction</div>
        </div>

        <div className="card bg-warning text-white">
          <div className="text-sm font-medium opacity-90">Highest Expense</div>
          <div className="text-3xl font-bold mt-2">${maxAmount.toFixed(2)}</div>
          <div className="text-xs opacity-75 mt-2">largest purchase</div>
        </div>

        <div className="card bg-text">
          <div className="text-sm font-medium text-white opacity-90">Top Category</div>
          <div className="text-3xl font-bold mt-2 text-white">{topCategory ? topCategory[0].split(" ")[0] : "N/A"}</div>
          <div className="text-xs opacity-75 mt-2 text-white">${topCategory ? topCategory[1].toFixed(2) : "0.00"}</div>
        </div>
      </div>

      {expenses.length > 0 && <CategoryBreakdown expenses={expenses} />}
    </div>
  )
}
