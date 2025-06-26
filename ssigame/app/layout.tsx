import type React from "react"
import "./globals.css"
import { baseMetadata } from "./meta"
import { ClientProviders } from "@/components/client-providers"

export const metadata = baseMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/favicon-32x32.png" as="image" type="image/png" />
        <link rel="preload" href="/placeholder-logo.svg" as="image" type="image/svg+xml" />
        
        {/* Google Fonts with preload */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          rel="preload" 
          href="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivNm4I81.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous" 
        />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
        
        {/* Preload critical API endpoints */}
        <link rel="prefetch" href="/api/leaderboard?timeframe=all" />
        <link rel="prefetch" href="/api/progress" />
        
        {/* Favicon - SOL SPACE INVADERS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        
        {/* Performance hints */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#F7BE38" />
      </head>
      <body className="min-h-screen bg-gray-950 text-white">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
