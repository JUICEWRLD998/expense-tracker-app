"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { type Expense, CATEGORIES } from "@/lib/db-utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ArrowUpDown, 
  Calendar as CalendarIcon,
  Download
} from "lucide-react"
import { format, subDays, startOfMonth, isAfter, isBefore, parseISO } from "date-fns"
import ExpenseForm from "@/components/expense-form"
import { Spinner } from "@/components/ui/spinner"

export default function ExpensesPage() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateRangeFilter, setDateRangeFilter] = useState("30days") // 30days, 7days, month, all
  const [sortBy, setSortBy] = useState("date-desc") // date-desc, date-asc, amount-desc, amount-asc

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Load expenses
  useEffect(() => {
    if (user) {
      loadExpenses()
    }
  }, [user])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error("Failed to load expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and Sort Logic
  const filteredExpenses = useMemo(() => {
    let result = [...expenses]

    // 1. Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (exp) => 
          exp.title.toLowerCase().includes(query) || 
          exp.category.toLowerCase().includes(query)
      )
    }

    // 2. Category Filter
    if (categoryFilter !== "all") {
      result = result.filter((exp) => exp.category === categoryFilter)
    }

    // 3. Date Range Filter
    const today = new Date()
    if (dateRangeFilter === "7days") {
      const last7Days = subDays(today, 7)
      result = result.filter((exp) => isAfter(parseISO(exp.date), last7Days))
    } else if (dateRangeFilter === "30days") {
      const last30Days = subDays(today, 30)
      result = result.filter((exp) => isAfter(parseISO(exp.date), last30Days))
    } else if (dateRangeFilter === "month") {
      const startMonth = startOfMonth(today)
      result = result.filter((exp) => isAfter(parseISO(exp.date), startMonth))
    }

    // 4. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "amount-desc":
          return Number(b.amount) - Number(a.amount)
        case "amount-asc":
          return Number(a.amount) - Number(b.amount)
        default:
          return 0
      }
    })

    return result
  }, [expenses, searchQuery, categoryFilter, dateRangeFilter, sortBy])

  // Pagination Logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, dateRangeFilter, sortBy])

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Group by date
    const grouped = filteredExpenses.reduce((acc, exp) => {
      const date = exp.date.split('T')[0] // YYYY-MM-DD
      acc[date] = (acc[date] || 0) + Number(exp.amount)
      return acc
    }, {} as Record<string, number>)

    // Convert to array and sort by date
    return Object.entries(grouped)
      .map(([date, amount]) => ({
        date,
        displayDate: format(parseISO(date), "MMM dd"),
        amount
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14) // Show last 14 data points max for clarity
  }, [filteredExpenses])

  // Stats
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
  const avgAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0

  // Handlers
  const handleAddExpense = async (data: Omit<Expense, "id" | "user_id">) => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await loadExpenses()
        setShowAddDialog(false)
      }
    } catch (error) {
      console.error("Failed to add expense:", error)
    }
  }

  const handleEditExpense = async (data: Omit<Expense, "id" | "user_id">) => {
    if (!selectedExpense) return
    
    try {
      setActionLoading(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/expenses/${selectedExpense.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await loadExpenses()
        setShowEditDialog(false)
        setSelectedExpense(null)
      }
    } catch (error) {
      console.error("Failed to update expense:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return
    
    try {
      setActionLoading(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/expenses/${selectedExpense.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await loadExpenses()
        setShowDeleteDialog(false)
        setSelectedExpense(null)
      }
    } catch (error) {
      console.error("Failed to delete expense:", error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              Manage and analyze your spending habits.
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm
                onSubmit={handleAddExpense}
                onCancel={() => setShowAddDialog(false)}
                submitLabel="Add Expense"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats & Chart Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Stats Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Spent (Filtered)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${totalAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {filteredExpenses.length} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Transaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${avgAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per expense
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Column */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Spending Trend</CardTitle>
              <CardDescription>Daily spending for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="displayDate" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Date
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      {payload[0].payload.displayDate}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Amount
                                    </span>
                                    <span className="font-bold">
                                      ${Number(payload[0].value).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="currentColor" 
                        radius={[4, 4, 0, 0]} 
                        className="fill-primary" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    No data to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex flex-1 flex-col md:flex-row gap-4 w-full">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Date Range" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[160px]">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Sort By" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="amount-desc">Highest Amount</SelectItem>
                <SelectItem value="amount-asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpenses.length > 0 ? (
                  paginatedExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(parseISO(expense.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(expense.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedExpense(expense)
                                setShowEditDialog(true)
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedExpense(expense)
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No expenses found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <ExpenseForm 
              initialData={selectedExpense}
              onSubmit={handleEditExpense}
              onCancel={() => setShowEditDialog(false)}
              submitLabel={actionLoading ? "Saving..." : "Save Changes"}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense
              {selectedExpense && ` "${selectedExpense.title}"`} from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <Button 
              onClick={handleDeleteExpense}
              disabled={actionLoading}
              variant="destructive"
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
