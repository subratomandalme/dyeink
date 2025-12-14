import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// PART B: Verify env variables
console.log('--- SUPABASE DEBUG ---')
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'FOUND (Length ' + import.meta.env.VITE_SUPABASE_ANON_KEY.length + ')' : 'MISSING')
console.log('----------------------')

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
