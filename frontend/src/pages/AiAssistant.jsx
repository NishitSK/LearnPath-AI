import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE } from '../config';
import './Pages.css';
import './AiAssistant.css';

const AiAssistant = () => {
  const { isSignedIn, getToken, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [noSolutionsMessage, setNoSolutionsMessage] = useState('');
  const refreshInFlightRef = useRef(false);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const isChatInitDoneRef = useRef(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! How can I assist you with your skill set or technology learning today?'
    }
  ]);

  // Load user-specific data when userId is available
  useEffect(() => {
    if (isSignedIn && userId && !isChatInitDoneRef.current) {
      const savedChat = localStorage.getItem(`ai_chat_messages_${userId}`);
      if (savedChat) {
        try { 
          const parsed = JSON.parse(savedChat);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChatMessages(parsed);
          }
        } catch (e) { console.error(e); }
      }
      const savedAnalysis = localStorage.getItem(`ai_skill_analysis_${userId}`);
      if (savedAnalysis) {
        try { setAnalysis(JSON.parse(savedAnalysis)); } catch (e) { console.error(e); }
      }
      isChatInitDoneRef.current = true;
    } else if (!isSignedIn) {
      // Clear current state on logout/not-signed-in
      setChatMessages([{ role: 'assistant', content: 'Hello! How can I assist you with your skill set or technology learning today?' }]);
      setAnalysis(null);
      isChatInitDoneRef.current = false;
    }
  }, [isSignedIn, userId]);

  // Persist messages whenever they change (user-specific)
  useEffect(() => {
    if (isSignedIn && userId && isChatInitDoneRef.current) {
      localStorage.setItem(`ai_chat_messages_${userId}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, isSignedIn, userId]);

  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'analysis', 'notes'
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isNewData, setIsNewData] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Autoscroll removed as requested: stay at top
  }, [chatMessages, chatSending, activeTab]);

  const fetchAnalysis = useCallback(async (force = false) => {
    if (!isSignedIn) return;

    if (!force && refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;

    // Detection logic
    const updatedFlag = localStorage.getItem('learning_activity_updated');
    const isNew = updatedFlag === 'true';

    setLoading(true);
    if (force) setIsManualRefresh(true);
    setError('');
    if (isNew) setIsNewData(true);

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/assessment/ai-analysis${force ? '?refresh=true' : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.details ? `${data.error} (${data.details})` : (data?.error || 'Failed to generate analysis.'));
      }

      if (data?.noSubmissions) {
        setAnalysis(null);
        setNoSolutionsMessage(data.message || 'No solution submitted to view AI analysis.');
        if (userId) localStorage.removeItem(`ai_skill_analysis_${userId}`);
      } else {
        setNoSolutionsMessage('');
        setAnalysis(data);
        if (userId) localStorage.setItem(`ai_skill_analysis_${userId}`, JSON.stringify(data));
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
      setIsNewData(false);
      localStorage.removeItem('learning_activity_updated');
    } catch (err) {
      setNoSolutionsMessage('');
      if (!analysis) setError(err.message || 'Unable to load strategy analysis.');
    } finally {
      setLoading(false);
      setIsManualRefresh(false);
      refreshInFlightRef.current = false;
    }
  }, [isSignedIn, userId, getToken, setLoading, setAnalysis, setIsManualRefresh]);

  // Stable ref for getToken so fetchNotes doesn't recreate on every render
  const getTokenRef = useRef(getToken);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

  // Notes CRUD — fetchNotes is stable (no getToken in deps)
  const fetchNotes = useCallback(async () => {
    if (!isSignedIn || !userId) return;
    try {
      const token = await getTokenRef.current();
      console.log('[Fetch Notes] Getting notes for user:', userId);
      
      const res = await fetch(`${API_BASE}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('[Fetch Notes] Received', data.length, 'notes');
        setNotes(data);
      } else {
        console.error('[Fetch Notes] Failed with status:', res.status);
        const errorData = await res.json();
        console.error('[Fetch Notes] Error:', errorData);
      }
    } catch (err) { 
      console.error('Notes fetch error:', err); 
    }
  }, [isSignedIn, userId]); // stable — getToken accessed via ref

  const saveNote = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!noteContent.trim() || !isSignedIn) return;
    
    try {
      const token = await getTokenRef.current();
      const method = editingNote ? 'PUT' : 'POST';
      const url = editingNote
        ? `${API_BASE}/api/notes/${editingNote._id}`
        : `${API_BASE}/api/notes`;

      console.log(`[Note Save] ${method} ${url}`, { title: noteTitle, contentLength: noteContent.length });

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: noteTitle || 'Untitled Note', 
          content: noteContent 
        }),
      });

      const data = await res.json();
      
      console.log(`[Note Save] Response:`, { status: res.status, ok: res.ok, data });

      if (res.ok) {
        // Optimistic update - add newly saved note
        if (editingNote) {
          setNotes(prev => prev.map(n => n._id === data._id ? data : n));
          console.log('[Note Save] Updated existing note');
        } else {
          setNotes(prev => [data, ...prev]);
          console.log('[Note Save] Added new note to list');
        }
        setNoteTitle('');
        setNoteContent('');
        setEditingNote(null);
        setError('');
      } else {
        const errorMessage = data.error || `Failed to save note (${res.status})`;
        const errorDetails = data.details ? ` - ${data.details}` : '';
        console.error('Note save failed:', errorMessage + errorDetails);
        setError(errorMessage + errorDetails);
      }
    } catch (err) { 
      console.error('Note save error:', err);
      setError('Failed to save note. Please try again.');
    }
  };

  const deleteNote = async (id) => {
    if (!isSignedIn) return;
    try {
      const token = await getTokenRef.current();
      
      console.log('[Note Delete] DELETE /api/notes/' + id);
      
      const res = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('[Note Delete] Response:', { status: res.status, ok: res.ok });
      
      if (res.ok) {
        setNotes(prev => prev.filter(n => n._id !== id));
        setError('');
        console.log('[Note Delete] Note removed from list');
      } else {
        const data = await res.json();
        const errorMessage = data.error || `Failed to delete note (${res.status})`;
        const errorDetails = data.details ? ` - ${data.details}` : '';
        console.error('Note delete failed:', errorMessage + errorDetails);
        setError(errorMessage + errorDetails);
      }
    } catch (err) { 
      console.error('Note delete error:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  // Fetch notes once on sign-in — fetchNotes is now stable so no infinite loop
  useEffect(() => {
    if (isSignedIn) fetchNotes();
  }, [isSignedIn, fetchNotes]);

  const sendChatMessage = useCallback(async () => {
    const message = chatInput.trim();
    if (!message || chatSending || !isSignedIn) return;

    const nextMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(nextMessages);
    setChatInput('');
    setChatSending(true);

    try {
      const token = await getToken();
      const conversation = nextMessages.slice(-10).map((item) => ({
        role: item.role,
        content: item.content,
      }));

      const res = await fetch(`${API_BASE}/api/assessment/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: conversation }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to get mentor response.');
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: (data?.response || 'I can help with tech skills, coding, and learning strategy. Ask me a specific question.')
                   .replace(/\*\*/g, ''),
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err?.message || 'Unable to respond right now. Please try again.',
        }
      ]);
    } finally {
      setChatSending(false);
    }
  }, [chatInput, chatSending, isSignedIn, chatMessages, getToken]);

  if (!isSignedIn) {
    return (
      <div className="page-container">
        <h1 className="page-title">AI Submission Analysis</h1>
        <div className="page-content">
          <p>Please sign in to view real-time weak areas and improvement suggestions from your latest submissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container ai-assistant-theme">
      {/* Premium Option Bar / Tabs */}
      <div className="option-bar-container">
        <div className="premium-option-bar">
          <button 
            className={`option-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            AI Assistant
          </button>
          <button 
            className={`option-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            Improvement Areas
          </button>
          <button 
            className={`option-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Your Notes
          </button>
        </div>
      </div>

      <div className="assistant-main-content">
        {activeTab === 'chat' && (
          <aside className="assistant-centered-pane animate-fade-in">
            <div className="chat-shell">
              <div className="chat-messages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                    <div className="message-bubble">
                      {msg.role === 'assistant' && (
                        <div className="bubble-header">
                          <span className="icon">🤖</span> AI Assistant
                        </div>
                      )}
                      <div className="message-content">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {chatSending && (
                  <div className="message-wrapper assistant">
                    <div className="message-bubble">
                      <div className="bubble-header">
                        <span className="icon">🤖</span> AI Assistant
                      </div>
                      <div className="message-content typing">Processing your technical inquiry...</div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-area-wrap">
                <div className="chat-input-area">
                  <textarea
                    placeholder="Enter your prompt ..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    disabled={chatSending}
                    rows={1}
                  />
                </div>
                <button 
                  className="send-btn" 
                  onClick={sendChatMessage} 
                  disabled={chatSending || !chatInput.trim()}
                  title="Send Prompt"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </aside>
        )}

        {activeTab === 'analysis' && (
          <section className="assistant-centered-pane animate-fade-in">
            <div className="assistant-header compact">
              <div className="header-left">
                <div className={`status-badge ${loading ? 'syncing' : ''}`}>
                  {loading ? 'AI SYNCHRONIZATION ACTIVE...' : 'AI ANALYTICS SECURE'}
                </div>
                <div className="evaluation-title-row">
                  <h1 className="hero-title">Skill <span className="gradient-text">Evaluation</span></h1>
                  <button 
                    className={`analyse-btn ${isManualRefresh ? 'loading-state' : ''}`} 
                    onClick={() => fetchAnalysis(true)} 
                    disabled={loading}
                    title="Analyse Latest Performance"
                  >
                    <span className="btn-text">
                      {isManualRefresh && <span className="spinner"></span>}
                      {isManualRefresh ? 'Analysing Latest Insights...' : 'Analyse Strategy'}
                    </span>
                  </button>
                </div>
                {lastUpdated && <span className="last-updated-tag">Latest Update: {lastUpdated} {isNewData && '• NEW SYNC'}</span>}
              </div>
            </div>

            {loading && !analysis ? (
              <div className="skeleton-grid-single">
                <div className="skeleton-card" style={{ height: '120px' }}></div>
                <div className="skeleton-card" style={{ height: '300px' }}></div>
                <div className="skeleton-card" style={{ height: '200px' }}></div>
              </div>
            ) : error ? (
              <div className="error-card">
                <p>No analysis found. Complete your technical assessment to view personalized improvement areas.</p>
                <button className="btn-secondary" onClick={() => fetchAnalysis(true)}>Retry Synchronization</button>
              </div>
            ) : analysis ? (
              <div className="analysis-grid stretch animate-fade-in">
                <div className="summary-card glass-effect">
                  <div className="card-header">
                    <span className="icon">📊</span>
                    <h3>Executive Summary</h3>
                    <div className="level-badge gradient-glow">{analysis.level || 'Emerging'}</div>
                  </div>
                  <p className="summary-text">{analysis.summary || analysis.executiveSummary}</p>
                </div>

                <div className="analysis-card red-theme entry-1">
                  <div className="card-header"><span className="icon">🎯</span><h3>Critical Weak Areas</h3></div>
                  <div className="gap-list">
                    {(analysis.weakAreas || analysis.skillGaps || []).map((gap, i) => (
                      <div key={i} className="gap-item">
                        <div className="gap-meta">
                          <span className="gap-area">{gap.area}</span>
                          <span className={`severity-badge ${gap.severity?.toLowerCase()}`}>{gap.severity}</span>
                        </div>
                        <p className="gap-desc">{gap.reason || gap.gap}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analysis-card blue-theme entry-2">
                  <div className="card-header"><span className="icon">⚡</span><h3>Acceleration Tactics</h3></div>
                  <ul className="standards-list">
                    {(analysis.improvementAreas || analysis.bestPractices || []).map((item, i) => (
                      <li key={i}>{typeof item === 'string' ? item : item.title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>Synthesis engine waiting for new performance records.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'notes' && (
          <div className="notes-container animate-fade-in single-pane">
            <div className="note-editor-pane">
              <div className="note-shell">
                <div className="note-header">
                  <h3>{editingNote ? 'Editing Note' : 'Your Notes'}</h3>
                  <span className="notes-count-badge">{notes.length} saved</span>
                </div>

                {error && (
                  <div className="error-banner" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fee', borderRadius: '0.5rem', color: '#c00', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{error}</span>
                    <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                  </div>
                )}

                {/* Notes feed - displays notes like chat messages */}
                <div className="notes-feed">
                  {notes.length === 0 ? (
                    <div className="empty-notes-prompt">
                      No notes yet. Type below and hit send to capture your first insight.
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note._id} className="note-message-card">
                        <button
                          className="note-delete-btn"
                          title="Delete note"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this note?')) deleteNote(note._id);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M9 6V4h6v2"></path>
                          </svg>
                        </button>
                        <div className="note-message-body" onClick={() => {
                          setEditingNote(note);
                          setNoteTitle(note.title);
                          setNoteContent(note.content);
                        }}>
                          <div className="note-message-top">
                            {note.title && <span className="note-message-title">{note.title}</span>}
                            <span className="note-message-date">
                              {new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="note-message-text">{note.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input section - always at the bottom */}
                <div className="note-compose-area">
                  {editingNote && (
                    <div className="note-edit-banner">
                      ✏️ Editing note — <button className="btn-ghost-inline" onClick={() => { setEditingNote(null); setNoteTitle(''); setNoteContent(''); }}>Cancel</button>
                    </div>
                  )}
                  <div className="note-input-wrap">
                    <div className="note-inputs">
                      <input
                        type="text"
                        placeholder="Your Note"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                      />
                      <textarea
                        placeholder="Write a note or insight..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && noteContent.trim()) {
                            e.preventDefault();
                            saveNote(e);
                          }
                        }}
                        rows={3}
                      />
                    </div>
                    <button
                      className="send-btn"
                      onClick={saveNote}
                      disabled={!noteContent.trim()}
                      title={editingNote ? 'Update Note' : 'Save Note'}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;
