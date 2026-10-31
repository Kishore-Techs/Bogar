import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BogarProvider } from './context/BogarContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BogarProvider>
      <App />
    </BogarProvider>
  </StrictMode>,
)
