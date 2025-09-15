import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Hub from './pages/Hub'
import DataMapper from './pages/DataMapper'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/data-mapper" element={<DataMapper />} />
      </Route>
    </Routes>
  )
}

export default App
