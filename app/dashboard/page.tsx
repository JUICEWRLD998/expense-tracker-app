"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { type Expense, getExpenses, addExpense } from "@/lib/db-utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"
import ExpenseForm from "@/components/expense-form"
import CategoryBreakdown from "@/components/category-breakdown"
import { DollarSign, TrendingUp, TrendingDown, Plus, Receipt } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Load expenses when component mounts or user changes
  useEffect(() => {
    if (user) {
      const allExpenses = getExpenses(user.id)
      setExpenses(allExpenses)
    }
  }, [user])

  const handleAddExpense = (data: Omit<Expense, "id" | "userId">) => {
    if (user) {
      addExpense(user.id, data)
      const allExpenses = getExpenses(user.id)
      setExpenses(allExpenses)
      setShowAddDialog(false)
    }
  }

  const handleExpensesUpdate = () => {
    if (user) {
      const allExpenses = getExpenses(user.id)
      setExpenses(allExpenses)
    }
  }

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const thisMonthExpenses = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  const lastMonthExpenses = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const year = currentMonth === 0 ? currentYear - 1 : currentYear
      return expDate.getMonth() === lastMonth && expDate.getFullYear() === year
    })
    .reduce((sum, exp) => sum + exp.amount, 0)

  const monthChange = lastMonthExpenses > 0 
    ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0

  // Get recent 5 expenses
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Calculate category distribution for pie chart
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  // Define vibrant colors for pie chart
  const pieColors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
  ]

  const chartData = Object.entries(categoryTotals).map(([category, amount], index) => ({
    category,
    amount,
    fill: pieColors[index % pieColors.length],
  }))

  const chartConfig = {
    amount: {
      label: " Amount",
    },
  } satisfies ChartConfig

  const highestCategory = chartData.length > 0 
    ? chartData.reduce((max, item) => item.amount > max.amount ? item : max, chartData[0])
    : null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Here's your expense overview.
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

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${thisMonthExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {monthChange >= 0 ? "+" : ""}
                {monthChange.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Month</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${lastMonthExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Previous period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
              <p className="text-xs text-muted-foreground">Total count</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBreakdown expenses={expenses} />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Spending by Category</CardTitle>
              <CardDescription className="text-xs">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {chartData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[200px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie 
                      data={chartData} 
                      dataKey="amount" 
                      nameKey="category"
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                  No expense data available
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-1 text-xs pt-2">
              {highestCategory && (
                <>
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Top: {highestCategory.category}
                  </div>
                  <div className="text-muted-foreground leading-none">
                    ${highestCategory.amount.toFixed(2)}
                  </div>
                </>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Recent Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExpenses.length > 0 ? (
                  recentExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description || "No description"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-medium">${expense.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No expenses yet. Add your first expense to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
