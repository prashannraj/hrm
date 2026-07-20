import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Glow Forward Foundation - Appan HRM Portal',
  description: 'Appan HRMS portal built with Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
