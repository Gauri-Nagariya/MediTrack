import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AppContextProvider from './Context/AppContext.jsx'
import { Suspense } from 'react'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
   <AppContextProvider>
    <Suspense fallback={<p>Loading...</p>}>
    <App />
    </Suspense>
  </AppContextProvider>
  </BrowserRouter>
)
