import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/app'
import { Providers } from './components/providers'
import './styles/index.css'

const rootElement = document.getElementById('root') as HTMLElement

createRoot(rootElement).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
)
