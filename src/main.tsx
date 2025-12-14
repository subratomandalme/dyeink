import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

