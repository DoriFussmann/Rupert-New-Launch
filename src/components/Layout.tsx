import { Outlet } from 'react-router-dom'
import Header from './Header'

function Layout() {
  return (
    <div>
      <header>
        <div className="container">
          <Header />
        </div>
      </header>
      <main>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout


