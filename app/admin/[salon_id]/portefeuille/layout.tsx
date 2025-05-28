import NavPortefeuille from "./components/nav-portefeuille"

export default async function FinanceLayout({
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
      <NavPortefeuille salonId={salon_id}/>

      {/* Main content */}
      <main className="flex-1 pb-20 px-4">{children}</main>
    </div>
  )
}
