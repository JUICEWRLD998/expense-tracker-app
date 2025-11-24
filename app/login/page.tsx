"use client"

import { motion } from "framer-motion"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/lib/auth-context"
import { LoaderIcon } from "lucide-react"

export default function LoginPage() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <motion.div
        className="w-full max-w-sm md:max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <LoginForm />
      </motion.div>
    </div>
  )
}
