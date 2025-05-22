import { create } from "zustand"

type BookingStep = 0 | 1 | 2 | 3 | 4 | 5

interface BookingState {
  step: BookingStep
  serviceId: string | null
  fullName: string
  phoneNumber: string
  selectedDate: Date | null
  barberId: string | null
  estimatedTime: string | null
  orderNumber: number | null
  appointmentId: string | null
  setStep: (step: BookingStep) => void
  setServiceId: (id: string) => void
  setUserInfo: (name: string, phone: string) => void
  setDate: (date: Date) => void
  setBarberId: (id: string | null) => void
  setResult: (orderNumber: number, estimatedTime: string, appointmentId: string) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  serviceId: null,
  fullName: "",
  phoneNumber: "",
  selectedDate: null,
  barberId: null,
  estimatedTime: null,
  orderNumber: null,
  appointmentId: null,
  setStep: (step) => set({ step }),
  setServiceId: (id) => set({ serviceId: id }),
  setUserInfo: (fullName, phoneNumber) => set({ fullName, phoneNumber }),
  setDate: (selectedDate) => set({ selectedDate }),
  setBarberId: (id) => set({ barberId: id }),
  setResult: (orderNumber, estimatedTime, appointmentId) => set({ orderNumber, estimatedTime, appointmentId }),
  reset: () =>
    set({
      step: 0,
      serviceId: null,
      fullName: "",
      phoneNumber: "",
      selectedDate: null,
      barberId: null,
      estimatedTime: null,
      orderNumber: null,
      appointmentId: null,
    }),
}))
