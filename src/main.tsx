import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import GlobalNav from './GlobalNav.tsx'
import { LangProvider } from './contexts/LangContext.tsx'

// SPA redirect for GitHub Pages 404.html
const redirect = sessionStorage.getItem('redirect')
if (redirect) {
  sessionStorage.removeItem('redirect')
  window.history.replaceState(null, '', redirect)
}

const root = document.getElementById('root')!

createRoot(root).render(
  <StrictMode>
    <LangProvider>
      <GlobalNav />
      <App />
    </LangProvider>
  </StrictMode>
)
