import React from 'react'
import { createRoot } from 'react-dom/client'
import '../style.css'
import Counter from './Counter.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Counter />
  </React.StrictMode>
)
