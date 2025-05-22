"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react"
import type { StepNavigationProps } from "../types/booking"

export function StepNavigation({
  onBack,
  onNext,
  canProceed,
  isLoading = false,
  isLastStep = false,
  nextLabel = "Continuer",
  backLabel = "Retour",
}: StepNavigationProps) {
  return (
    <div className="flex gap-3 mt-6">
      <Button variant="outline" className="flex-1" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {backLabel}
      </Button>
      <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={onNext} disabled={isLoading || !canProceed}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            {nextLabel}
            {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
          </>
        )}
      </Button>
    </div>
  )
}
