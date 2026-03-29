import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Assessments from './pages/Assessments'
import LearningPlans from './pages/LearningPlans'
import Progress from './pages/Progress'
import AiAssistant from './pages/AiAssistant'
import StrokeLogoLoader from './components/StrokeLogoLoader'
import Footer from './components/Footer'
import StarBackground from './components/StarBackground'
import './App.css';

function HomeRedirect() {
  const { isSignedIn } = useUser();
  return isSignedIn ? <Navigate to="/learning-plans" replace /> : <Home />;
}

function AppContent() {
  const location = useLocation();
  const [showPageLoader, setShowPageLoader] = useState(true);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    const isFirstLoad = initialLoadRef.current;
    setShowPageLoader(true);
    const timer = setTimeout(() => {
      setShowPageLoader(false);
      initialLoadRef.current = false;
    }, 900);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={`app-container theme-dark${showPageLoader ? ' is-loading' : ''}`}>
      <StarBackground />
      <div className="bg-beam bg-beam-1"></div>
      <div className="bg-beam bg-beam-2"></div>
      <div className="bg-beam bg-beam-3"></div>

      <Navbar />

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/about" element={<About />} />
        <Route path="/assessments" element={<ProtectedRoute><Assessments theme="dark" /></ProtectedRoute>} />
        <Route path="/learning-plans" element={<ProtectedRoute><LearningPlans /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
      </Routes>

      <Footer />

      {showPageLoader && createPortal(
        <div className="route-loader-overlay" aria-live="polite" aria-label="Loading page">
          <StrokeLogoLoader size={200} label="learning and beyond ..." />
        </div>,
        document.body
      )}
    </div>
  );
}

function App() {
  useEffect(() => {
    document.body.classList.remove('theme-light')
    document.body.classList.add('theme-dark')
  }, [])

  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
