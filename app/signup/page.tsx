"use client"

import { motion } from "framer-motion"
import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <motion.div
        className="w-full max-w-sm md:max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SignupForm />
      </motion.div>
    </div>
  )
}
