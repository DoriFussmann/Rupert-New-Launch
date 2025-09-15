import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Hub from './pages/Hub'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/hub" element={<Hub />} />
      </Route>
    </Routes>
  )
}

export default App
