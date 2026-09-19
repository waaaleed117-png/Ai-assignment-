import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Assignment Writing',
  description: 'Create clear academic assignments with AI',
  icons: { icon: 'https://i.ibb.co/vSTwzN4/file-00000000b458820ba17ad3a6083d1542.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><Providers>{children}</Providers></body></html>
}
