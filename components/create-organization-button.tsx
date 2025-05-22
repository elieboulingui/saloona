"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function CreateOrganizationButton() {
    
  const router = useRouter()

  return (
    <motion.div
      className="fixed bottom-20 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        onClick={() => router.push("/register")}
        size="lg"
        className="rounded-full h-14 w-14 bg-amber-500 hover:bg-amber-600 shadow-lg"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Créer un salon</span>
      </Button>
    </motion.div>
  )
}
