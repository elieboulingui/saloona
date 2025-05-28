import PortefeuillePage from "./components/portefeuille"

export default async function page({ params }: { params: Promise<{ salon_id: string }> }) {

  const {salon_id} = await params

  return <PortefeuillePage salonId={salon_id} />
}