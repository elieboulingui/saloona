import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { startOfDay, addDays } from "date-fns"
import { CalendarPageClient } from "./components/calendar-page-client"


export default async function CalendarPage({ params }: { params: Promise<{ salon_id: string }> }) {

  const {salon_id} = await params


  const tomorrow = startOfDay(addDays(new Date(), 1))

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="bg-amber-500 p-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-white font-bold text-xl">Calendrier</h1>
          <p className="text-white/80 text-xs">{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <CalendarIcon className="h-5 w-5 text-white" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        <CalendarPageClient salonId={salon_id} />
      </main>
    </div>
  )
}
