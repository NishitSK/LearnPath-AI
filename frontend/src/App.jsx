import React, { useState, useEffect, useRef, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Assessments from './pages/Assessments'
import LearningPlans from './pages/LearningPlans'
import Progress from './pages/Progress'
import AiAssistant from './pages/AiAssistant'
import StrokeLogoLoader from './components/StrokeLogoLoader'
import StarBackground from './components/StarBackground'
import Footer from './components/Footer'
import DecryptedText from './components/DecryptedText/DecryptedText'
import './App.css';
import './styles/uiSystem.css';

function AppContent({ theme, onToggleTheme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPageLoader, setShowPageLoader] = useState(true);
  const initialLoadRef = useRef(true);
  const authToastTimerRef = useRef(null);
  const [loaderVariant, setLoaderVariant] = useState('logo');
  const [loadingMessage, setLoadingMessage] = useState('ACCESSING DATA...');

  const pageMessages = useMemo(() => ({
    '/': 'ACCESSING HUB...',
    '/assessments': 'ANALYZING SKILLSET...',
    '/learning-plans': 'OPTIMIZING CURRICULUM...',
    '/progress': 'CALIBRATING PERFORMANCE...',
    '/ai-assistant': 'SYNCHRONIZING NEURAL AI...',
    '/about': 'RETRIEVING INTEL...'
  }), []);

  useEffect(() => {
    const isFirstLoad = initialLoadRef.current;
    setLoaderVariant(isFirstLoad ? 'logo' : 'brain');
    
    if (!isFirstLoad) {
      const msg = pageMessages[location.pathname] || 'ACCESSING DATA...';
      setLoadingMessage(msg);
    }

    setShowPageLoader(true);
    window.scrollTo(0, 0);
    
    // Keep loader visible briefly, but reduce wait for faster page display.
    const delay = isFirstLoad ? 2200 : 1000;
    const timer = setTimeout(() => {
      setShowPageLoader(false);
      initialLoadRef.current = false;
    }, delay);
    
    return () => clearTimeout(timer);
  }, [location.pathname, pageMessages]);

  useEffect(() => {
    if (showPageLoader) return;

    const params = new URLSearchParams(location.search);
    const authToast = params.get('auth');
    if (authToast !== 'login' && authToast !== 'logout') return;

    const toastMessage = authToast === 'login'
      ? 'Login successful'
      : 'Logged out successfully';

    if (authToastTimerRef.current) {
      window.clearTimeout(authToastTimerRef.current);
    }

    // Wait briefly so the routed page settles before showing toast.
    authToastTimerRef.current = window.setTimeout(() => {
      toast.success(toastMessage, { id: 'auth-success' });

      params.delete('auth');
      const nextSearch = params.toString();
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : '',
        },
        { replace: true }
      );

      authToastTimerRef.current = null;
    }, 420);

    return () => {
      if (authToastTimerRef.current) {
        window.clearTimeout(authToastTimerRef.current);
      }
    };
  }, [location.pathname, location.search, navigate, showPageLoader]);

  return (
    <div className={`app-container theme-${theme}`}>
      <Toaster
        position="top-center"
        containerStyle={{
          top: 'clamp(10px, 3.5vw, 28px)',
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 3800,
          style: {
            background: '#0a0a0c',
            color: '#f8fafc',
            border: '2px solid rgba(0, 230, 118, 0.4)',
            borderRadius: '12px',
            fontSize: '0.86rem',
            padding: '10px 14px',
            boxShadow: '0 0 25px rgba(0, 230, 118, 0.25), 0 14px 32px rgba(0, 0, 0, 0.6)',
            fontWeight: 700,
            letterSpacing: '0.02em',
            textAlign: 'center',
            minWidth: 0,
            width: 'min(90vw, 340px)',
            margin: '0 auto'
          },
          success: {
            iconTheme: {
              primary: '#00E676',
              secondary: '#1e293b'
            }
          }
        }}
      />
      <StarBackground />
      <div className="bg-beam bg-beam-1"></div>
      <div className="bg-beam bg-beam-2"></div>
      <div className="bg-beam bg-beam-3"></div>

      <AnimatePresence mode="wait">
        {showPageLoader ? (
          <motion.div 
            key="loader"
            className="route-loader-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            aria-live="polite" 
            aria-label="Loading page"
          >
            {loaderVariant === 'logo' ? (
              <StrokeLogoLoader size={180} label="learning and beyond ..." fade="in" gradient={true} />
            ) : (
              <div className="decrypted-loader-wrapper">
                <DecryptedText 
                  text={loadingMessage}
                  speed={45}
                  maxIterations={12}
                  sequential={true}
                  revealDirection="center"
                  animateOn="view"
                  className="revealed-text"
                  encryptedClassName="encrypted-text"
                  style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 800, 
                    letterSpacing: '0.15em',
                    fontFamily: '"Space Mono", monospace'
                  }}
                />
                <div className="loader-sub-line">SYSTEM SECURE • ENCRYPTED TUNNEL ACTIVE</div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            className="app-content-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Navbar theme={theme} onToggleTheme={onToggleTheme} />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/assessments" element={<ProtectedRoute><Assessments theme={theme} /></ProtectedRoute>} />
              <Route path="/learning-plans" element={<ProtectedRoute><LearningPlans /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
            </Routes>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('learnpath-theme') || 'dark')

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    localStorage.setItem('learnpath-theme', theme)
    document.body.classList.remove('theme-dark', 'theme-light')
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  return (
    <Router>
      <AppContent theme={theme} onToggleTheme={handleThemeToggle} />
    </Router>
  )
}

export default App
