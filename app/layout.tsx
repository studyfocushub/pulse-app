import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pulse — Know Your Brain | StudyFocus Hub',
  description: 'Track one week. Discover exactly how your brain works best. Personalised study insights, forget predictor, and AI coach built around YOU.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
