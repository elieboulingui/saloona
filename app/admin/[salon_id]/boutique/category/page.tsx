import CategoryAdminPageClient from "./components/category-page-client"

export default async function ProductsPage({ params }: { params: Promise<{ salon_id: string }> }) {

  const {salon_id} = await params

  return <CategoryAdminPageClient salonId={salon_id} />
}
