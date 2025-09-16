import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/inter/400.css'
import './index.css'
import App from './App.tsx'
import { AdvisorsProvider } from './state/AdvisorsContext'
import { StructuresProvider } from './state/StructuresContext'
import { TasksProvider } from './state/TasksContext'
import { CompaniesProvider } from './state/CompaniesContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AdvisorsProvider>
        <StructuresProvider>
          <TasksProvider>
            <CompaniesProvider>
              <App />
            </CompaniesProvider>
          </TasksProvider>
        </StructuresProvider>
      </AdvisorsProvider>
    </BrowserRouter>
  </StrictMode>,
)
