import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import './Pages.css';

const API_BASE = 'http://localhost:3000';

const AiAssistant = () => {
  const { isSignedIn, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Lumina, your Neural Growth Agent. How can I help you reach your goals today?" }
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const fetchAnalysis = useCallback(async () => {
    if (!isSignedIn) return;

    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/assessment/ai-analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.details ? `${data.error} (${data.details})` : (data?.error || 'Failed to generate analysis.'));
      }
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Unable to load agent analysis.');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (isSignedIn) {
      fetchAnalysis();
    }
  }, [isSignedIn, fetchAnalysis]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setChatLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/assessment/ai-chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Chat failed');

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="page-container">
        <h1 className="page-title">Personal AI Agent</h1>
        <div className="page-content">
          <p>Please sign in to interact with your neural agent.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container neural-theme" style={{ 
      padding: '1.5rem 2rem 1rem', 
      position: 'relative', 
      zIndex: 10,
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(5, 5, 10, 0.7)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        background: 'rgba(255,255,255,0.03)',
        padding: '0.8rem 1.5rem',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.8rem', background: 'linear-gradient(135deg, #fff 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lumina Intelligence</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: '0.1rem 0 0' }}>Neural growth trajectory & code synthesis</p>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', gap: '0.8rem' }}>
             <button className="btn-secondary" onClick={fetchAnalysis} disabled={loading} style={{ fontSize: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem' }}>
               {loading ? 'Sequencing...' : '🧬 Refresh Analysis'}
             </button>
             <button 
               className="btn-primary" 
               onClick={() => setIsChatOpen(!isChatOpen)}
               style={{ fontSize: '0.75rem', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: isChatOpen ? '#4f46e5' : '#6366f1' }}
             >
               💬 Ask Lumina {isChatOpen ? '▲' : '▼'}
             </button>
          </div>
        </div>
        
        {analysis && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Current Standing</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fcd34d' }}>{analysis.level}</div>
             </div>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(252, 211, 77, 0.1)', border: '1px solid rgba(252, 211, 77, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🎓</div>
          </div>
        )}
      </div>

      {isChatOpen && (
        <div style={{ 
          marginBottom: '1.5rem', 
          background: 'rgba(255,255,255,0.04)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '20px', 
          padding: '1.2rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          animation: 'slideDown 0.3s ease-out',
          zIndex: 100
        }}>
           <div className="neural-chat-container" style={{ display: 'flex', flexDirection: 'column', background: 'transparent', border: 'none', borderRadius: 0, minHeight: 'auto', height: 'auto' }}>
              <div className="chat-history" style={{ height: '300px', overflowY: 'auto', borderRadius: '12px', marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ 
                      maxWidth: '75%', 
                      padding: '0.8rem 1.2rem', 
                      borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      background: msg.role === 'user' ? '#6366f1' : 'rgba(255,255,255,0.06)',
                      fontSize: '0.9rem',
                      color: 'white'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Lumina is synthesizing a response...</div>}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.8rem' }}>
                <input 
                  type="text" 
                  className="lp-input" 
                  placeholder="Inquire about your career path or technical gaps..." 
                  style={{ flex: 1, height: '45px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 1rem', color: 'white' }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button type="submit" className="btn-primary" style={{ height: '45px', borderRadius: '12px', padding: '0 1.5rem' }} disabled={chatLoading || !input.trim()}>Send</button>
              </form>
           </div>
        </div>
      )}

      <div className="agent-layout" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(350px, 1fr) 2fr', 
        gap: '1.5rem', 
        flex: 1
      }}>
        
        <div className="neural-insights-panel" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.2rem', 
          overflowY: 'visible', 
          background: 'transparent',
          padding: 0,
          border: 'none'
        }}>
          
          {loading && !analysis ? (
            <div className="page-content" style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="pulse-loader" style={{ fontSize: '2rem' }}>🧬</div>
              <p>Sequencing neural insights...</p>
            </div>
          ) : error ? (
            <div className="page-content neuro-card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', textAlign: 'center', padding: '2rem' }}>
              <h3 style={{ color: '#f87171', marginTop: 0 }}>Analysis Diverged</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.9rem' }}>{error}</p>
              <button className="btn-secondary" onClick={fetchAnalysis} style={{ marginTop: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                Retry Sequence
              </button>
            </div>
          ) : analysis ? (
            <>
              <div className="page-content neuro-card" style={{ borderLeft: '4px solid #6366f1', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent)', padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>✨ Neural Mentorship Pitch</h3>
                <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: '#d1d5db', lineHeight: 1.6 }}>"{analysis.pitch}"</p>
              </div>

              <div className="page-content neuro-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔴 Targeted Vulnerabilities</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                  {(analysis.weakAreas || []).map((area, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(248, 113, 113, 0.05)', borderRadius: '10px', border: '1px solid rgba(248, 113, 113, 0.1)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171', boxShadow: '0 0 8px #f87171' }} />
                      <span style={{ fontSize: '0.9rem', color: '#fca5a5', fontWeight: 500 }}>{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {(analysis.badges || []).map((badge, i) => (
                  <span key={i} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', fontSize: '0.75rem', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 500 }}>
                    🏆 {badge}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="page-content" style={{ textAlign: 'center', opacity: 0.5 }}>
              <p>Ready to sequence your growth. Submit more solutions or update your profile to generate a snapshot.</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {analysis && (
            <>
              <div className="page-content neuro-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginTop: 0, fontSize: '1.2rem', color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>🚀 Recommended Growth Path</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginTop: '1.5rem' }}>
                  {(analysis.suggestions || []).map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(45, 212, 191, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', border: '1px solid rgba(45, 212, 191, 0.3)', color: '#2dd4bf' }}>{i+1}</div>
                      <div style={{ fontSize: '0.9rem', color: '#e5e7eb', lineHeight: 1.5 }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="page-content neuro-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(99, 102, 241, 0.03))' }}>
                <h3 style={{ marginTop: 0, fontSize: '1.2rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>🛠️ Elite Code Standards</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Professional improvements based on your latest architectural decisions.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(analysis.bestPractices || []).map((practice, i) => (
                    <div key={i} style={{ padding: '1rem 1.2rem', background: 'rgba(129, 140, 248, 0.05)', borderRadius: '12px', border: '1px solid rgba(129, 140, 248, 0.12)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ color: '#818cf8', fontSize: '1.1rem' }}>✔</div>
                      <div style={{ fontSize: '0.95rem', color: '#d1d5db' }}>{practice}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .neural-theme {
          background: radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.15), transparent 50%),
                      radial-gradient(circle at top left, rgba(168, 85, 247, 0.15), transparent 50%);
        }
        .neuro-card {
          backdrop-filter: blur(12px);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, border-color 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.03);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          border-radius: 20px;
        }
        .neuro-card:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.15);
        }
        .pulse-loader {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.4; transform: scale(0.9); }
        }
        .chat-history::-webkit-scrollbar {
          width: 5px;
        }
        .chat-history::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AiAssistant;
