import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SalarisTool HCH',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
