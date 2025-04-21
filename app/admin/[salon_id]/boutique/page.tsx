import BoutiqueAdminPageClient from "./components/product-client-page"

export default async function ProductsPage({ params }: { params: Promise<{ salon_id: string }> }) {

  const {salon_id} = await params

  return <BoutiqueAdminPageClient salonId={salon_id} />
}
