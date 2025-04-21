import WaitingPageClient from "./components/waiting-page-client"

export default async function WaitingPage({ params }: { params: Promise<{ salon_id: string }> }) {

  const {salon_id} = await params

  return <WaitingPageClient salonId={salon_id} />
}
