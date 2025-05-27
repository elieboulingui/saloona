import NavBlogs from "./components/nav-blog"

export default async function BlogsLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ salon_id: string }>
}>) {

  const { salon_id } = await params
 
  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50">

      {/* Header */}
      <NavBlogs salonId={salon_id}/>

      {/* Main content */}
      <main className="flex-1 pb-20 px-4">{children}</main>
    </div>
  )
}
