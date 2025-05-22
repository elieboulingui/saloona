export type BookingStep = 0 | 1 | 2 | 3 | 4 | 5

export interface BarberType {
  id: string
  name: string
  image?: string
  speciality?: string
  services?: { serviceId: string }[]
}

export interface ServiceCartItem {
  serviceId: string
  serviceName: string
  price: number
  duration: number
}

export interface BookingResult {
  success: boolean
  orderNumber?: number
  estimatedTime?: number
  appointmentId?: string
  error?: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface PaymentModalProps {
  status: "creating" | "pending" | "checking" | "success" | "failed"
  message: string
  onClose: () => void
  onRetry: () => void
  checkCount: number
}

export interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
}

export interface BookingHeaderProps {
  step: BookingStep
  countdown: number
  appointmentId: string | null
  onBack: () => void
  salonId: string
}

export interface StepNavigationProps {
  onBack: () => void
  onNext: () => void
  canProceed: boolean
  isLoading?: boolean
  isLastStep?: boolean
  nextLabel?: string
  backLabel?: string
}
