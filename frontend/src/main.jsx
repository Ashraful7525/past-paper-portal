import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Debug: Check if environment variables are loaded
console.log('🔍 Frontend Environment Variables Debug:')
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing')
console.log('GEMINI_API_KEY:', import.meta.env.GEMINI_API_KEY ? '✅ Loaded' : '❌ Missing')
console.log('NODE_ENV:', import.meta.env.MODE)
console.log('All env vars:', import.meta.env)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
