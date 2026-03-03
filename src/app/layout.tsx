import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TermWise Beta | OSU Course Planner',
  description:
    'Build and validate term-by-term course plans with prerequisite checks, offering constraints, persistence, and GPA estimates.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
