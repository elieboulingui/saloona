import { UserDetailsPageClient } from "./components/user-details-page-client"

export default async function UserDetailsPage({ params }: { params: Promise<{ salon_id: string, id: string  }> }) {

  const {salon_id, id} = await params
  return <UserDetailsPageClient userId={id} salonId={salon_id} />
}
