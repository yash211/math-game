import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// gradient.addColorStop(0, 'rgba(46, 131, 183, 0.8)');
//         gradient.addColorStop(1, 'rgba(37, 235, 123, 0.6)');
