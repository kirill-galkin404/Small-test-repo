import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import Counter from './Counter.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Counter />
  </StrictMode>,
)
