import OrdersPageClient from "./components/order-page-client"

export default async function ProductsPage({ params }: { params: Promise<{ salon_id: string }> }) {

  const {salon_id} = await params

  return <OrdersPageClient salonId={salon_id} />
}
