import { Link, useLocation } from 'react-router-dom'
import Button from './Button'

function Header() {
  const location = useLocation()
  const onHub = location.pathname.startsWith('/hub')
  const to = onHub ? '/' : '/hub'
  const label = onHub ? 'Home' : 'Hub'

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 16 }}>Home</div>
      <Link to={to}>
        <Button label={label} />
      </Link>
    </div>
  )
}

export default Header


