import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SALOONA - La Solution Digitale complète pour salons de coiffure",
  description:
    "Gérez vos réservations, votre boutique, votre file d'attente et votre équipe avec Saloona, la solution tout-en-un pour les salons de coiffure modernes.",
}

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
