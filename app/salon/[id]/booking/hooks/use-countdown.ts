"use client"

import { useState, useRef, useEffect } from "react"

export function useCountdown(initialTime = 300) {
  const [countdown, setCountdown] = useState(initialTime)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const startCountdown = (onComplete?: () => void) => {
    setCountdown(initialTime)

    if (countdownRef.current) clearInterval(countdownRef.current)

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          if (onComplete) onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  return { countdown, startCountdown, stopCountdown }
}
