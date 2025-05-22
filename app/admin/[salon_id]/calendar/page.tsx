import { CalendarPageClient } from "./components/calendar-page-client"

export default async function CalendarPage({ params }: { params: Promise<{ salon_id: string }> }) {

  const {salon_id} = await params

  return (
    <div className="flex flex-col min-h-[100dvh]">

      {/* Main content */}
      <main className="flex-1 p-0">
        <CalendarPageClient salonId={salon_id} />
      </main>
    </div>
  )
}
