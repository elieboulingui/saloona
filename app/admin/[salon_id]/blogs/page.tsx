import BlogPageClient from "./components/clientblog"

export default async function ProductsPage({ params }: { params: Promise<{ salon_id: string }> }) {

  const {salon_id} = await params

  return <BlogPageClient salonId={salon_id} />
}