import type { ReactNode } from 'react'
import '../src/index.css'

export const metadata = {
  title: 'Rupert',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container" style={{ paddingTop: 16, paddingBottom: 16 }}>
          {children}
        </div>
      </body>
    </html>
  )
}


