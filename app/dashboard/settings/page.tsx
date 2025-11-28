"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Sun, Moon, User, Mail, Loader2, Lock, DollarSign, Trash2, Eye, EyeOff } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

const CURRENCIES = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "INR", label: "Indian Rupee", symbol: "₹" },
  { value: "CNY", label: "Chinese Yuan", symbol: "¥" },
  { value: "NGN", label: "Nigerian Naira", symbol: "₦" },
  { value: "MYR", label: "Malaysian Ringgit", symbol: "RM" },
]

const CURRENCY_STORAGE_KEY = "expense-tracker-currency"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
}

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { user, updateUser, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Currency state
  const [currency, setCurrency] = useState("USD")

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  // Prevent hydration mismatch and set initial values
  useEffect(() => {
    setMounted(true)
    if (user?.name) {
      setName(user.name)
    }
    // Load currency from localStorage
    const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (savedCurrency) {
      setCurrency(savedCurrency)
    }
  }, [user])

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    )
  }

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty")
      return
    }

    if (name === user?.name) {
      return // No changes
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()
      updateUser(data.user)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = name !== user?.name

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    setIsChangingPassword(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast.error(error.message || "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleCurrencyChange = (value: string) => {
    setCurrency(value)
    localStorage.setItem(CURRENCY_STORAGE_KEY, value)
    toast.success(`Currency changed to ${value}`)
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password")
      return
    }

    setIsDeleting(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account")
      }

      toast.success("Account deleted successfully")
      logout()
      router.push("/login")
    } catch (error: any) {
      console.error("Error deleting account:", error)
      toast.error(error.message || "Failed to delete account")
    } finally {
      setIsDeleting(false)
      setDeletePassword("")
    }
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
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your app preferences and account settings.
          </p>
        </motion.div>

        {/* Profile Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Display Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>

              {/* Save Button */}
              {hasChanges && (
                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Password Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full sm:w-auto"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="dark-mode" className="text-base font-medium">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isDark ? "Dark theme is enabled" : "Light theme is enabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Currency Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Currency</CardTitle>
              <CardDescription>
                Set your preferred currency for displaying amounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium">
                      Display Currency
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Amounts will be shown in this currency.
                    </p>
                  </div>
                </div>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.symbol} {curr.value} - {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone - Delete Account */}
        <motion.div variants={itemVariants}>
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all your data. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="shrink-0">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data including expenses, budgets, and settings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-4">
                      <Label htmlFor="deletePassword">
                        Enter your password to confirm
                      </Label>
                      <div className="relative">
                        <Input
                          id="deletePassword"
                          type={showDeletePassword ? "text" : "password"}
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Your password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowDeletePassword(!showDeletePassword)}
                        >
                          {showDeletePassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeletePassword("")}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={!deletePassword || isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
