import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"

import { ourFileRouter } from "@/app/api/uploadthing/core"
import { SessionProvider } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Saloona - Annuaire de salons de coiffure",
  description: "Trouvez les meilleurs salon spécialise et reserver votre place pour sublimer votre style et votre beauté.",
  manifest: "/manifest.json",
  themeColor: "#F59E0B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Saloona",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="application-name" content="Dread In Gabon" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dread In Gabon" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#F59E0B" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#F59E0B" />

        <link rel="apple-touch-icon" href="/icons/apple-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-icon-167x167.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={cn(inter.className)}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster />
        

        {/* Script pour enregistrer le service worker des notifications */}
        <Script id="register-service-worker" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js')
                  .then(function(registration) {
                    console.log('Service Worker enregistré avec succès:', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('Échec de l\\'enregistrement du Service Worker:', error);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
