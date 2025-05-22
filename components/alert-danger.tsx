import type React from "react"
import { AlertCircle } from "lucide-react"

interface AlertDangerProps {
  message: string
}

export const AlertDanger: React.FC<AlertDangerProps> = ({ message }) => {
  return (
    <div
      className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
      role="alert"
    >
      <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
      <span className="sr-only">Danger</span>
      <div>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  )
}

