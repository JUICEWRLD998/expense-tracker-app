"use client"

import { useState } from "react"
import { CATEGORIES } from "@/lib/db-utils"
import { Button } from "@/components/ui/button"

interface ExpenseFiltersProps {
  onFilterChange: (category: string, startDate: string, endDate: string) => void
}

export default function ExpenseFilters({ onFilterChange }: ExpenseFiltersProps) {
  const [category, setCategory] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const handleFilter = () => {
    onFilterChange(category, startDate, endDate)
  }

  const handleReset = () => {
    setCategory("")
    setStartDate("")
    setEndDate("")
    onFilterChange("", "", "")
  }

  return (
    <div className="mt-6">
      <button onClick={() => setShowFilters(!showFilters)} className="text-primary hover:underline text-sm font-medium">
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {showFilters && (
        <div className="card mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleFilter} className="btn-primary">
              Apply Filters
            </Button>
            <Button onClick={handleReset} className="btn-secondary">
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
