import type { Metadata, Viewport } from 'next'
import '@/shared/styles/globals.css'

export const metadata: Metadata = {
  title: 'DRACHLAND — Мои активы',
  description: 'Мобильная настольная игра о компаниях, сделках и капитале',
  applicationName: 'DRACHLAND',
  icons: {
    icon: '/assets/icon_new.png',
    apple: '/assets/icon_new.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#100C0C',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  )
}
