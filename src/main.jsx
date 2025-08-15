import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
   <WalletProvider> 
    <App />
    </WalletProvider>
  </BrowserRouter>
)
