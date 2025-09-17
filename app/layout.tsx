import type { ReactNode } from 'react'
import '../src/index.css'
import Providers from './providers'

export const metadata = {
  title: 'Rupert',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="container" style={{ paddingTop: 16, paddingBottom: 16 }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}


