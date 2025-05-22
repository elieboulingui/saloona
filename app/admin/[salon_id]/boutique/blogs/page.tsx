import BlogPageClient from "./components/BlogPageClient";

export default function Page({ params }: { params: { salon_id: string } }) {
  return <BlogPageClient salonId={params.salon_id} />;
}
