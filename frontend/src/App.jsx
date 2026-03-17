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
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/assessments" element={<ProtectedRoute><Assessments /></ProtectedRoute>} />
          <Route path="/learning-plans" element={<ProtectedRoute><LearningPlans /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
