import FinancePage from "./components/FinancePage"

export default async function ProductsPage({ params }: { params: Promise<{ salon_id: string }> }) {

  const {salon_id} = await params

  return <FinancePage salonId={salon_id} />
}
