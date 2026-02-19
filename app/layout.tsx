import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "NM Parfum Racikan — System",
  description: "Sistem manajemen NM Parfum Racikan - POS, Inventori, Laporan",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#B45309",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${plusJakarta.variable} ${fraunces.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
