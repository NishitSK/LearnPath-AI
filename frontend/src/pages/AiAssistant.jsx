import React, { useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './Pages.css';

const API_BASE = 'http://localhost:3000';

const COURSES_BY_AREA = {
  fundamentals: [
    'JavaScript and TypeScript Essentials',
    'Python for Problem Solving',
    'SQL Foundations for Developers',
  ],
  problemSolving: [
    'DSA Patterns: Arrays, Two Pointers, Sliding Window',
    'Dynamic Programming Interview Playbook',
    'Binary Search and Recursion Deep Dive',
  ],
  consistency: [
    '30-Day Coding Challenge Plan',
    'Interview Prep Weekly Sprint Template',
  ],
  systemDesign: [
    'System Design Basics: APIs, Caching, Databases',
    'Scalable Backend Architecture for SDE Roles',
  ],
};

function buildAnalysis(submissions, learningProfile) {
  const quizSubs = submissions.filter((s) => s.submissionType === 'quiz');
  const codingSubs = submissions.filter((s) => s.submissionType === 'coding');

  const totalQuizScore = quizSubs.reduce((sum, s) => sum + (s.score || 0), 0);
  const totalQuizQuestions = quizSubs.reduce((sum, s) => sum + (s.totalQuestions || 0), 0);
  const quizAccuracy = totalQuizQuestions > 0 ? Math.round((totalQuizScore / totalQuizQuestions) * 100) : 0;

  const languageCounts = codingSubs.reduce((acc, s) => {
    const key = s.language || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const strongestLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const languageVariety = Object.keys(languageCounts).length;

  const weakAreas = [];
  const suggestions = [];
  const courseSet = new Set();

  if (quizAccuracy < 65) {
    weakAreas.push('Core fundamentals need reinforcement (quiz accuracy below 65%).');
    suggestions.push('Spend 30-45 mins daily revising language basics and solving easy-to-medium MCQs.');
    COURSES_BY_AREA.fundamentals.forEach((c) => courseSet.add(c));
  }

  if (codingSubs.length < 5) {
    weakAreas.push('Coding practice volume is low. Increase hands-on problem solving.');
    suggestions.push('Target at least 5 coding submissions per week with mixed topics.');
    COURSES_BY_AREA.consistency.forEach((c) => courseSet.add(c));
  }

  if (languageVariety <= 1 && codingSubs.length > 0) {
    weakAreas.push('Language exposure is narrow; practice in one additional language for flexibility.');
    suggestions.push('Practice at least two problems weekly in a second language (TypeScript/Python recommended).');
  }

  const targetGoal = learningProfile?.goal || '';
  if (targetGoal === 'swe' || targetGoal === 'sde' || targetGoal === 'job') {
    weakAreas.push('System design depth is likely insufficient for SWE/SDE interview loops.');
    suggestions.push('Add 2 system design sessions per week (HLD/LLD + tradeoff discussions).');
    COURSES_BY_AREA.systemDesign.forEach((c) => courseSet.add(c));
  }

  if (weakAreas.length === 0) {
    weakAreas.push('No major weak spots detected from current data. Keep sharpening medium/hard problems.');
    suggestions.push('Move toward timed mock interviews and advanced system design case studies.');
  }

  if (courseSet.size === 0) {
    COURSES_BY_AREA.problemSolving.forEach((c) => courseSet.add(c));
  }

  return {
    totalSubmissions: submissions.length,
    quizAttempts: quizSubs.length,
    codingAttempts: codingSubs.length,
    quizAccuracy,
    strongestLanguage,
    weakAreas,
    suggestions,
    courses: Array.from(courseSet),
  };
}

const AiAssistant = () => {
  const { isSignedIn, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);

  const learningProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem('learning_plan_profile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const analysis = useMemo(() => buildAnalysis(submissions, learningProfile), [submissions, learningProfile]);

  const handleAnalyze = async () => {
    if (!isSignedIn) {
      setError('Please sign in to analyze your skillset.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/assessment/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load submissions.');
      }
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to analyze right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Lumina AI Mentor</h1>

      <div className="page-content" style={{ marginBottom: '1rem' }}>
        <p style={{ margin: 0, color: '#9ca3af' }}>
          Analyze your saved quiz and coding submissions to identify weak areas and get improvement suggestions.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze My Skillset'}
          </button>
          {submissions.length > 0 && (
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Loaded {submissions.length} submissions from database
            </span>
          )}
        </div>
        {error && <p style={{ color: '#f87171', marginTop: '0.75rem' }}>{error}</p>}
      </div>

      {submissions.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.9rem', marginBottom: '1rem' }}>
            <div className="page-content" style={{ padding: '1rem' }}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Quiz Accuracy</div>
              <div style={{ color: '#22c55e', fontSize: '1.5rem', fontWeight: 700 }}>{analysis.quizAccuracy}%</div>
            </div>
            <div className="page-content" style={{ padding: '1rem' }}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Coding Attempts</div>
              <div style={{ color: '#a78bfa', fontSize: '1.5rem', fontWeight: 700 }}>{analysis.codingAttempts}</div>
            </div>
            <div className="page-content" style={{ padding: '1rem' }}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Quiz Attempts</div>
              <div style={{ color: '#60a5fa', fontSize: '1.5rem', fontWeight: 700 }}>{analysis.quizAttempts}</div>
            </div>
            <div className="page-content" style={{ padding: '1rem' }}>
              <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Strongest Language</div>
              <div style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 700, textTransform: 'capitalize' }}>{analysis.strongestLanguage}</div>
            </div>
          </div>

          <div className="page-content" style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginTop: 0, color: 'white' }}>Weak Areas</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.9 }}>
              {analysis.weakAreas.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>

          <div className="page-content" style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginTop: 0, color: 'white' }}>Improvement Suggestions</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.9 }}>
              {analysis.suggestions.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>

          <div className="page-content">
            <h3 style={{ marginTop: 0, color: 'white' }}>Recommended Courses</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.9 }}>
              {analysis.courses.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>
        </>
      )}

      {!loading && submissions.length === 0 && !error && (
        <div className="page-content" style={{ color: '#9ca3af' }}>
          Submit at least one quiz or coding challenge, then click "Analyze My Skillset".
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
