import React from 'react'
import { createRoot } from 'react-dom/client'

function Placeholder() {
  return <div>Loading…</div>
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Placeholder />
  </React.StrictMode>,
)
