import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { brandConfig } from '@/lib/config'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NavigationProgress from '@/components/NavigationProgress'
import { Toaster } from 'sonner'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: brandConfig.siteTitle,
  description: brandConfig.siteDescription,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Toaster position="top-right" richColors />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
