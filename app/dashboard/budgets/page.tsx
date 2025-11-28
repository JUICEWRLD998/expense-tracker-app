"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { type Budget, type Expense, CATEGORIES } from "@/lib/db-utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Wallet, TrendingUp, AlertTriangle } from "lucide-react"
import BudgetForm from "@/components/budget-form"
import { Spinner } from "@/components/ui/spinner"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
}

export default function BudgetsPage() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  
  // Current month/year for viewing
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Load data
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, currentMonth, currentYear])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      
      // Load budgets for current month/year
      const budgetsRes = await fetch(
        `/api/budgets?month=${currentMonth}&year=${currentYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      // Load all expenses (to calculate spent amounts)
      const expensesRes = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json()
        setBudgets(budgetsData)
      }

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate spending per category for current month
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {}
    
    expenses.forEach((expense) => {
      const expDate = new Date(expense.date)
      if (expDate.getMonth() + 1 === currentMonth && expDate.getFullYear() === currentYear) {
        spending[expense.category] = (spending[expense.category] || 0) + Number(expense.amount)
      }
    })
    
    return spending
  }, [expenses, currentMonth, currentYear])

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0)
  const totalSpent = Object.values(categorySpending).reduce((sum, val) => sum + val, 0)
  const totalRemaining = totalBudget - totalSpent
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Month navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString("default", { 
    month: "long", 
    year: "numeric" 
  })

  // Categories without budget set
  const categoriesWithoutBudget = CATEGORIES.filter(
    (cat) => !budgets.find((b) => b.category === cat)
  )

  // Handlers
  const handleAddBudget = async (data: { category: string; amount: number }) => {
    try {
      setActionLoading(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          month: currentMonth,
          year: currentYear,
        }),
      })

      if (response.ok) {
        await loadData()
        setShowAddDialog(false)
      } else {
        const err = await response.json()
        alert(err.error || "Failed to add budget")
      }
    } catch (error) {
      console.error("Failed to add budget:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditBudget = async (data: { category: string; amount: number }) => {
    if (!selectedBudget) return

    try {
      setActionLoading(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/budgets/${selectedBudget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: data.amount }),
      })

      if (response.ok) {
        await loadData()
        setShowEditDialog(false)
        setSelectedBudget(null)
      }
    } catch (error) {
      console.error("Failed to update budget:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteBudget = async () => {
    if (!selectedBudget) return

    try {
      setActionLoading(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/budgets/${selectedBudget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        await loadData()
        setShowDeleteDialog(false)
        setSelectedBudget(null)
      }
    } catch (error) {
      console.error("Failed to delete budget:", error)
    } finally {
      setActionLoading(false)
    }
  }

  // Get status color and icon
  const getStatus = (spent: number, budget: number) => {
    const percent = (spent / budget) * 100
    if (percent >= 100) return { color: "text-destructive", bg: "bg-destructive", icon: AlertTriangle, label: "Over budget" }
    if (percent >= 80) return { color: "text-yellow-500", bg: "bg-yellow-500", icon: AlertTriangle, label: "Near limit" }
    return { color: "text-green-500", bg: "bg-green-500", icon: TrendingUp, label: "On track" }
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
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
            <p className="text-muted-foreground">
              Set and track your monthly spending limits.
            </p>
          </div>
          <Button 
            className="gap-2" 
            onClick={() => setShowAddDialog(true)}
            disabled={categoriesWithoutBudget.length === 0}
          >
            <Plus className="h-4 w-4" />
            Add Budget
          </Button>
        </motion.div>

        {/* Month Navigator */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold min-w-[200px] text-center">
                  {monthName}
                </h2>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Overview Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Monthly Overview
              </CardTitle>
              <CardDescription>Your total budget vs spending for {monthName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-1xl font-bold">₦{totalBudget.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="text-1xl font-bold">₦{totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`text-1xl font-bold ${totalRemaining < 0 ? "text-destructive" : "text-green-500"}`}>
                    ₦{totalRemaining.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className={overallProgress > 100 ? "text-destructive" : ""}>
                    {overallProgress.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(overallProgress, 100)} 
                  className={`h-3 ${overallProgress > 100 ? "[&>div]:bg-destructive" : overallProgress > 80 ? "[&>div]:bg-yellow-500" : ""}`}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Cards */}
        {budgets.length > 0 ? (
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
          >
            {budgets.map((budget) => {
              const spent = categorySpending[budget.category] || 0
              const remaining = Number(budget.amount) - spent
              const progress = (spent / Number(budget.amount)) * 100
              const status = getStatus(spent, Number(budget.amount))
              const StatusIcon = status.icon

              return (
                <motion.div key={budget.id} variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{budget.category}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedBudget(budget)
                              setShowEditDialog(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedBudget(budget)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">₦{Number(budget.amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-medium">₦{spent.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className={`font-medium ${remaining < 0 ? "text-destructive" : "text-green-500"}`}>
                          ₦{remaining.toFixed(2)}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={`h-2 ${progress > 100 ? "[&>div]:bg-destructive" : progress > 80 ? "[&>div]:bg-yellow-500" : ""}`}
                      />
                      <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        <span>{status.label} ({progress.toFixed(0)}%)</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="py-12 text-center">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No budgets set</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding a budget for {monthName} to track your spending.
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Budget
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Add Budget Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Budget for {monthName}</DialogTitle>
          </DialogHeader>
          <BudgetForm
            onSubmit={handleAddBudget}
            onCancel={() => setShowAddDialog(false)}
            submitLabel={actionLoading ? "Adding..." : "Add Budget"}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit {selectedBudget?.category} Budget</DialogTitle>
          </DialogHeader>
          {selectedBudget && (
            <BudgetForm
              initialData={{
                category: selectedBudget.category,
                amount: Number(selectedBudget.amount),
              }}
              onSubmit={handleEditBudget}
              onCancel={() => setShowEditDialog(false)}
              submitLabel={actionLoading ? "Saving..." : "Save Changes"}
              disableCategory
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the {selectedBudget?.category} budget for {monthName}. 
              Your expense data will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDeleteBudget}
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
