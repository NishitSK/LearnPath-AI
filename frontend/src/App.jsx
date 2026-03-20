import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Assessments from './pages/Assessments'
import LearningPlans from './pages/LearningPlans'
import Progress from './pages/Progress'
import AiAssistant from './pages/AiAssistant'
import './App.css';

function HomeRedirect() {
  const { isSignedIn } = useUser();
  return isSignedIn ? <Navigate to="/learning-plans" replace /> : <Home />;
}

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('learnpath-theme') || 'dark')

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
    }, 2350)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('learnpath-theme', theme)
    document.body.classList.remove('theme-dark', 'theme-light')
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  return (
    <Router>
      <div className={`app-container theme-${theme}`}>
        <Navbar theme={theme} onToggleTheme={handleThemeToggle} />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/assessments" element={<ProtectedRoute><Assessments theme={theme} /></ProtectedRoute>} />
          <Route path="/learning-plans" element={<ProtectedRoute><LearningPlans /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
