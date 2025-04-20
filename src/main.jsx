import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App'
import AnaSayfa from './pages/AnaSayfa'
import Favorites from './pages/Favorites'
import ChatSayfasi from './pages/chatSayfasi'
import ChatSayfasi2 from './pages/chatSayfasi2'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<AnaSayfa />} />
        <Route path="/app" element={<App />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/chat" element={<ChatSayfasi />} />
        <Route path="/chat2" element={<ChatSayfasi2 />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)
