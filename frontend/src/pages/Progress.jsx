import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE } from '../config';
import './Progress.css';

/* ── Palette ── */
const COLORS = {
  primary: '#FF1744', // Pink/Red highlight
  progress: '#00E676', // Neon Green
  secondary: '#E91E63',
  text: '#E6EDF3',
  muted: '#9CA3AF',
  card: '#0a0a0c',
  border: 'rgba(255, 255, 255, 0.08)'
};

/* ── Components ── */
const AvatarRing = ({ pct }) => {
  const size = 200; // Increased size
  const stroke = 10; // Slightly thicker stroke
  const radius = (size / 2) - 5; // Positioning ring further out
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="avatar-ring-container">
      {/* Removed Background Circle */}
      
      {/* The Progress Ring (Behind the head) */}
      <svg viewBox={`0 0 ${size} ${size}`} className="avatar-ring-svg">
        <circle
          stroke="rgba(255,255,255,0.05)"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={COLORS.progress}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {/* The Avatar Image (Pop out effect) */}
      <div className="avatar-img-circle">
        <img src="/avatar.png" alt="User Avatar" />
      </div>
    </div>
  );
};

export default function Progress() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchDashboard = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/assessment/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data = await res.json();
        setDashboard(data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || loading) {
    return (
      <div className="progress-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p style={{ color: COLORS.muted, marginTop: '1rem' }}>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="progress-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: COLORS.muted, fontSize: '1.1rem' }}>Please sign in to view your progress.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#f87171', fontSize: '1.1rem' }}>Error: {error}</p>
      </div>
    );
  }

  // Use fetched data, fallback to empty arrays
  const mainChartData = dashboard?.mainChartData || [];
  const codingQuestionsData = dashboard?.codingQuestionsData || [];
  const mcqData = dashboard?.mcqData || [];
  const quizData = dashboard?.quizData || [];
  const stats = dashboard?.stats || { totalSolved: 0, dailyStreak: 0, totalCoding: 0, totalQuiz: 0 };

  // Calculate completion percentage for the avatar ring
  const completionPct = stats.totalSolved > 0 ? Math.min(Math.round((stats.totalSolved / Math.max(stats.totalSolved, 50)) * 100), 100) : 0;

  return (
    <div className="progress-dashboard">
      <div className="dashboard-top-row">
        {/* Main Chart Section */}
        <div className="main-chart-card">
          <div className="chart-header-row">
            <div className="title-group">
              <h2>Track Your Progress</h2>
              <p>Showing Daily Rank/Score for your submission history</p>
            </div>
            <div className="stat-boxes">
              <div className="mini-stat-box">
                <span className="label">Daily Streak</span>
                <span className="value">{stats.dailyStreak}</span>
              </div>
              <div className="mini-stat-box">
                <span className="label">Overall Score</span>
                <span className="value">{stats.totalSolved}</span>
              </div>
            </div>
          </div>
          <div className="main-line-chart">
            {mainChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mainChartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                    contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} 
                    itemStyle={{ color: COLORS.primary }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    dot={{ fill: COLORS.primary, r: 4, strokeWidth: 2, stroke: COLORS.primary }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: COLORS.muted }}>No submissions yet. Start solving to track your progress!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Profile Widget */}
        <div className="profile-widget">
          <AvatarRing pct={completionPct} />
          <div className="sidebar-stats">
            <div className="sidebar-stat-box">
              <span className="label">Quiz Submissions</span>
              <div className="val-row">
                <span className="current">{stats.totalQuiz}</span>
                <span className="status">Completed</span>
              </div>
            </div>
            <div className="sidebar-stat-box">
              <span className="label">Coding Problems</span>
              <div className="val-row">
                <span className="current">{stats.totalCoding}</span>
                <span className="status">Solved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-row">
        {/* Daily Coding Bar Chart */}
        <div className="bottom-card">
          <h3>Daily Coding Questions Solved</h3>
          {codingQuestionsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={codingQuestionsData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: COLORS.muted, fontSize: 10 }} dy={5} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="solved" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: COLORS.muted, fontSize: '0.9rem' }}>No coding submissions yet.</p>
            </div>
          )}
        </div>

        {/* Daily MCQ Line Chart */}
        <div className="bottom-card">
          <h3>Daily In-Video MCQs Solved</h3>
          {mcqData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mcqData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: COLORS.muted, fontSize: 10 }} dy={5} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="solved"
                  stroke={COLORS.progress}
                  strokeWidth={2}
                  dot={{ fill: COLORS.progress, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: COLORS.muted, fontSize: '0.9rem' }}>No quiz submissions yet.</p>
            </div>
          )}
        </div>

        {/* Recent Quiz Horizontal Bar Chart */}
        <div className="bottom-card">
          <h3>Recent Quiz Solved</h3>
          {quizData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={quizData} layout="vertical" margin={{ left: 5, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: COLORS.muted, fontSize: 10 }} />
                <Bar dataKey="score" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={15}>
                  {quizData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: COLORS.muted, fontSize: '0.9rem' }}>No quizzes completed yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
