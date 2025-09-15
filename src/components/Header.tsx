import { Link } from 'react-router-dom'
import Button from './Button'

function Header() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 16 }}>Home</div>
      <Link to="/hub">
        <Button label="Hub" />
      </Link>
    </div>
  )
}

export default Header


