import { Link } from 'react-router-dom'
import Button from '../components/Button'

function Home() {
  return (
    <div className="stack">
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 400 }}>Home</h1>
      <p style={{ margin: 0, fontSize: 14, lineHeight: '20px' }}>Welcome.</p>
      <div>
        <Link to="/data-mapper">
          <Button label="Data Mapper" />
        </Link>
      </div>
    </div>
  )
}

export default Home


