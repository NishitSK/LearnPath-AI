import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE } from '../config';
import './Pages.css';
import './LearningPlans.css';

const TECH_STACKS = ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'Go', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'TypeScript', 'GraphQL', 'REST APIs'];

const GOALS = [
  { id: 'swe', label: 'SWE', desc: 'Become a strong Software Engineer' },
  { id: 'sde', label: 'SDE', desc: 'Prepare for Software Development Engineer roles' },
  { id: 'job', label: '🎯 Land a new job', desc: 'Prepare for interviews and job applications' },
  { id: 'promo', label: '🚀 Get promoted', desc: 'Level up your skills for a senior role' },
  { id: 'switch', label: '🔄 Switch domains', desc: 'Transition to a new tech area' },
  { id: 'freelance', label: '💼 Go freelance', desc: 'Build skills to work independently' },
];

const GENERATED_PLAN = [
  { week: 'Week 1–2', title: 'Foundation & Core Concepts', tasks: ['Data Structures Review', 'Algorithm Patterns (Sliding Window, Two Pointers)', 'System Design Basics'], color: '#6366f1' },
  { week: 'Week 3–4', title: 'Deep Dive into Your Stack', tasks: ['Advanced React Patterns', 'Node.js Performance Tuning', 'Database Optimization'], color: '#8b5cf6' },
  { week: 'Week 5–6', title: 'Interview Preparation', tasks: ['50 LeetCode Medium Problems', 'Mock System Design Interviews', 'Behavioral Question Practice'], color: '#a78bfa' },
  { week: 'Week 7–8', title: 'Real-world Projects', tasks: ['Build a Full-Stack Portfolio Project', 'Contribute to Open Source', 'Technical Blog Writing'], color: '#c4b5fd' },
];

export default function LearningPlans() {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    role: '',
    experience: '',
    stack: [],
    goal: '',
    hoursPerWeek: '',
    targetDate: '',
  });
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/assessment/user-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data) {
          setForm(data);
          setGenerated(true);
          localStorage.setItem('learning_plan_profile', JSON.stringify(data));
        } else {
          // Check local storage if DB fetch fails or no profile
          const raw = localStorage.getItem('learning_plan_profile');
          if (raw) {
            setForm(JSON.parse(raw));
            setGenerated(true);
          }
        }
      } catch (err) {
        console.error("Fetch profile failed:", err);
      }
    };
    fetchProfile();
  }, [isSignedIn, getToken]);

  const toggleStack = (tech) => {
    setForm(f => ({
      ...f,
      stack: f.stack.includes(tech) ? f.stack.filter(t => t !== tech) : [...f.stack, tech]
    }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      if (isSignedIn) {
        const token = await getToken();
        await fetch(`${API_BASE}/api/assessment/user-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        });
      }

      // Delay for effect
      await new Promise(r => setTimeout(r, 1500));
      setGenerated(true);
      localStorage.setItem('learning_plan_profile', JSON.stringify(form));
    } catch (err) {
      console.error("Failed to save profile:", err);
      // Fallback to local storage only if network fails
      setGenerated(true);
    } finally {
      setGenerating(false);
    }
  };

  const canNext1 = form.role && form.experience;
  const canNext2 = form.stack.length > 0;
  const canGenerate = form.goal && form.hoursPerWeek;

  const dynamicPlan = () => {
    const stackList = form.stack && form.stack.length > 0 ? form.stack : ['Core Tech'];
    const mainTech = stackList[0];
    const secTech = stackList.length > 1 ? stackList[1] : 'Ecosystem';
    const roleName = form.role || 'Software Engineer';
    const topStack = stackList.slice(0, 3).join(', ');

    return [
      { week: 'Week 1–2', title: `Foundation in ${roleName}`, tasks: [`Core concepts in ${roleName} principles`, `Deep dive into ${mainTech} fundamentals`, 'Algorithm & logic building basics'], color: '#6366f1' },
      { week: 'Week 3–4', title: `Mastering Your Stack`, tasks: [`Advanced architectural patterns in ${mainTech}`, `Integrating ${secTech} into your workflow`, 'Performance tuning and best practices'], color: '#8b5cf6' },
      { week: 'Week 5–6', title: 'Interview Preparation', tasks: ['Data structures problem solving', `Mock system design for ${roleName}`, 'Behavioral question practice'], color: '#a78bfa' },
      { week: 'Week 7–8', title: 'Real-world Projects', tasks: [`Build a complex portfolio project utilizing ${topStack}`, 'Implement CI/CD pipeline and deployment', 'Contribute to open source or technical blogging'], color: '#c4b5fd' },
    ];
  };

  return (
    <div className="page-container">
      <h1 className="page-title lp-page-title">Personalized Learning Plans</h1>

      {!generated ? (
        <div className="lp-form-wrapper">
          <div className="lp-steps">
            {['Profile', 'Tech Stack', 'Goals'].map((s, i) => (
              <div key={i} className={`lp-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
                <div className="lp-step-num">{step > i + 1 ? '✓' : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className="lp-card">
            {step === 1 && (
              <>
                <h2 className="lp-card-title">Tell us about yourself</h2>
                <div className="lp-field">
                  <label>Current / Target Role</label>
                  <input className="lp-input" placeholder="e.g. Full Stack Engineer, Backend Developer" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
                </div>
                <div className="lp-field">
                  <label>Years of Experience</label>
                  <div className="lp-radio-group">
                    {['0–1 years', '1–3 years', '3–5 years', '5+ years'].map(opt => (
                      <label key={opt} className={`lp-radio ${form.experience === opt ? 'selected' : ''}`}>
                        <input type="radio" name="exp" value={opt} checked={form.experience === opt} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <button className="btn-primary lp-next" disabled={!canNext1} onClick={() => setStep(2)}>Next →</button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="lp-card-title">Your Tech Stack</h2>
                <p className="lp-sub">Select all technologies you work with or want to learn</p>
                <div className="lp-tags">
                  {TECH_STACKS.map(tech => (
                    <button key={tech} className={`lp-tag ${form.stack.includes(tech) ? 'selected' : ''}`} onClick={() => toggleStack(tech)}>{tech}</button>
                  ))}
                </div>
                <div className="lp-row">
                  <button className="lp-back" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn-primary lp-next" disabled={!canNext2} onClick={() => setStep(3)}>Next →</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="lp-card-title">Your Learning Goals</h2>
                <div className="lp-goals">
                  {GOALS.map(g => (
                    <button key={g.id} className={`lp-goal ${form.goal === g.id ? 'selected' : ''}`} onClick={() => setForm(f => ({ ...f, goal: g.id }))}>
                      <span className="lp-goal-label">{g.label}</span>
                      <span className="lp-goal-desc">{g.desc}</span>
                    </button>
                  ))}
                </div>
                <div className="lp-field" style={{ marginTop: '1.5rem' }}>
                  <label>Hours available per week</label>
                  <div className="lp-radio-group">
                    {['1–5 hrs', '5–10 hrs', '10–20 hrs', '20+ hrs'].map(opt => (
                      <label key={opt} className={`lp-radio ${form.hoursPerWeek === opt ? 'selected' : ''}`}>
                        <input type="radio" name="hrs" value={opt} checked={form.hoursPerWeek === opt} onChange={e => setForm(f => ({ ...f, hoursPerWeek: e.target.value }))} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="lp-row">
                  <button className="lp-back" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn-primary lp-next" disabled={!canGenerate || generating} onClick={handleGenerate}>
                    {generating ? '⏳ Generating...' : '✨ Generate My Plan'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="lp-result">
          <div className="lp-result-header" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{ color: 'white', margin: 0 }}>Your 8-Week Roadmap</h2>
              <p style={{ color: '#9ca3af', margin: 0 }}>{form.role} · {form.experience} · {form.hoursPerWeek}/week</p>
              <div className="lp-stack-chips" style={{ marginTop: '0.5rem' }}>
                {form.stack.slice(0, 5).map(t => <span key={t} className="lp-chip">{t}</span>)}
                {form.stack.length > 5 && <span className="lp-chip">+{form.stack.length - 5}</span>}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="lp-back" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', margin: 0 }} onClick={() => { setGenerated(false); setStep(1); }}>← Regenerate Plan</button>
              <button className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }} onClick={() => navigate('/assessments')}>Test Your Skillset</button>
            </div>
          </div>
          <div className="lp-roadmap">
            {dynamicPlan().map((phase, i) => (
              <div key={i} className="lp-phase" style={{ '--phase-color': phase.color }}>
                <div className="lp-phase-line" />
                <div className="lp-phase-content">
                  <div className="lp-phase-week" style={{ color: phase.color }}>{phase.week}</div>
                  <h3 className="lp-phase-title">{phase.title}</h3>
                  <ul className="lp-phase-tasks">
                    {phase.tasks.map((t, j) => <li key={j}>{t}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
