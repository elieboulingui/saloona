import { create } from "zustand"
import { AppointmentStatus } from "@prisma/client"

type BookingStep = 0 | 1 | 2 | 3 | 4

interface BookingState {
  step: BookingStep
  serviceId: string | null
  fullName: string
  phoneNumber: string
  selectedDate: Date | null
  estimatedTime: string | null
  orderNumber: number | null
  appointmentId: string | null
  setStep: (step: BookingStep) => void
  setServiceId: (id: string) => void
  setUserInfo: (name: string, phone: string) => void
  setDate: (date: Date) => void
  setResult: (orderNumber: number, estimatedTime: string, appointmentId: string) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 0,
  serviceId: null,
  fullName: "",
  phoneNumber: "",
  selectedDate: null,
  estimatedTime: null,
  orderNumber: null,
  appointmentId: null,
  setStep: (step) => set({ step }),
  setServiceId: (id) => set({ serviceId: id }),
  setUserInfo: (fullName, phoneNumber) => set({ fullName, phoneNumber }),
  setDate: (selectedDate) => set({ selectedDate }),
  setResult: (orderNumber, estimatedTime, appointmentId) =>
    set({ orderNumber, estimatedTime, appointmentId }),
  reset: () =>
    set({
      step: 0,
      serviceId: null,
      fullName: "",
      phoneNumber: "",
      selectedDate: null,
      estimatedTime: null,
      orderNumber: null,
      appointmentId: null,
    }),
}))
