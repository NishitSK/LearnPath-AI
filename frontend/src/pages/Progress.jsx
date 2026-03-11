import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import './Pages.css';
import './Progress.css';

/* ── Palette ── */
const C = {
  teal: '#14B8A6',
  amber: '#F59E0B',
  text: '#E6EDF3',
  muted: '#9CA3AF',
  dim: '#4B5563',
  card: '#161B22',
  easy: '#22C55E',
  medium: '#F59E0B',
  hard: '#EF4444',
  tealLight: 'rgba(20,184,166,0.2)',
  amberLight: 'rgba(245,158,11,0.2)'
};

/* ── Icons ── */
const Icon = {
  check: (c = C.teal) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  flame: (c = C.amber) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>,
  trophy: (c = C.amber) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
  goal: (c = C.teal) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  trendingUp: (c = C.teal) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
  alert: (c = C.hard) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  clock: (c = C.muted) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  zap: (c = C.amber) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  arrowRight: (c = C.teal) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
};

/* ── Data ── */
const solvedData = [
  { day: 'Feb 3', easy: 2, medium: 0, hard: 0, solved: 2 },
  { day: 'Feb 5', easy: 3, medium: 2, hard: 0, solved: 5 },
  { day: 'Feb 8', easy: 1, medium: 2, hard: 0, solved: 3 },
  { day: 'Feb 10', easy: 4, medium: 3, hard: 0, solved: 7 },
  { day: 'Feb 13', easy: 1, medium: 2, hard: 1, solved: 4 },
  { day: 'Feb 15', easy: 4, medium: 4, hard: 1, solved: 9 },
  { day: 'Feb 18', easy: 2, medium: 3, hard: 1, solved: 6 },
  { day: 'Feb 20', easy: 4, medium: 5, hard: 2, solved: 11 },
  { day: 'Feb 22', easy: 2, medium: 4, hard: 2, solved: 8 },
  { day: 'Feb 25', easy: 5, medium: 6, hard: 2, solved: 13 },
  { day: 'Feb 27', easy: 3, medium: 5, hard: 2, solved: 10 },
  { day: 'Mar 1', easy: 5, medium: 7, hard: 3, solved: 15 },
];

const weeklyStreak = [
  { week: 'W1', streak: 3 }, { week: 'W2', streak: 5 },
  { week: 'W3', streak: 2 }, { week: 'W4', streak: 7 },
  { week: 'W5', streak: 6 }, { week: 'W6', streak: 7 },
];

const categoryData = [
  { name: 'Arrays', solved: 24, pct: 100 },
  { name: 'Strings', solved: 18, pct: 75 },
  { name: 'DP', solved: 15, pct: 63 },
  { name: 'Trees', solved: 12, pct: 50 },
  { name: 'Sorting', solved: 10, pct: 42 },
  { name: 'Graphs', solved: 8, pct: 33 },
];

const radarData = [
  { subject: 'Arrays', A: 100, fullMark: 100 },
  { subject: 'Strings', A: 75, fullMark: 100 },
  { subject: 'Sorting', A: 42, fullMark: 100 },
  { subject: 'Trees', A: 50, fullMark: 100 },
  { subject: 'Graphs', A: 33, fullMark: 100 },
  { subject: 'DP', A: 63, fullMark: 100 },
];

const difficultyData = [
  { label: 'EASY', solved: 47, total: 60, color: C.easy },
  { label: 'MEDIUM', solved: 35, total: 55, color: C.medium },
  { label: 'HARD', solved: 11, total: 40, color: C.hard },
];

const weakTopics = [
  { topic: 'Graphs', lastSeen: '14 days ago', pct: 33 },
  { topic: 'Dynamic Prog.', lastSeen: '8 days ago', pct: 38 },
  { topic: 'Backtracking', lastSeen: '21 days ago', pct: 20 },
];

const recommendedDocs = [
  { title: "Introduction to Trie", type: "Article", time: "10 min" },
  { title: "Sliding Window Pattern", type: "Problems", time: "5 questions" },
  { title: "Mastering Backtracking", type: "Video", time: "15 min" },
  { title: "Graph BFS / DFS", type: "Video", time: "22 min" }
];

/* ── Helpers ── */
const Ring = ({ pct, color, size = 56, stroke = 4, label }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="ring-wrap" style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      {label && <span className="ring-label-inset" style={{ color }}>{label}</span>}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="tooltip-val" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Heatmap mock data
const generateHeatmapData = () => {
  const weeks = [];
  const today = new Date();
  for (let w = 22; w >= 0; w--) { // Expanded width for a fuller look
    const days = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + d));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const count = Math.random() > 0.4 ? Math.floor(Math.random() * 8) + 1 : 0;
      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      else if (count > 2 && count <= 4) level = 2;
      else if (count > 4 && count <= 6) level = 3;
      else if (count > 6) level = 4;

      days.push({ level, count, dateStr });
    }
    weeks.push(days);
  }
  return weeks;
}
const heatmapWeeks = generateHeatmapData();

// Weekly tracker data
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekDone = 4;
const weekGoal = 6;

export default function Progress() {
  const totalSolved = solvedData.reduce((s, d) => s + d.solved, 0);

  return (
    <div className="page-container progress-page">
      <div className="prog-header">
        <div>
          <h1 className="prog-title">Growth Analytics</h1>
          <p className="prog-subtitle">Comprehensive performance & velocity tracking</p>
        </div>
        <div className="prog-period-badge">Last 90 days</div>
      </div>

      {/* ── Row 1: KPI Grid (4 cols, NEW STYLE) ── */}
      <div className="prog-kpi-grid">
        <div className="prog-hero-card">
          <div className="prog-hero-icon-wrap" style={{ background: C.tealLight, borderColor: 'rgba(20,184,166,0.3)' }}>{Icon.check()}</div>
          <div className="prog-hero-label">Total Problems</div>
          <div className="prog-hero-value">{categoryData.reduce((s, c) => s + c.solved, 0)}</div>
          <div className="prog-hero-trend">{Icon.trendingUp()} <span>+12 this week</span></div>
        </div>

        <div className="prog-hero-card">
          <div className="prog-hero-icon-wrap" style={{ background: C.amberLight, borderColor: 'rgba(245,158,11,0.3)' }}>{Icon.flame()}</div>
          <div className="prog-hero-label">Consistency Score</div>
          <div className="prog-hero-value" style={{ color: C.amber }}>8.4<span style={{ fontSize: '1.2rem', color: C.muted }}>/10</span></div>
          <div className="prog-hero-trend" style={{ color: C.amber }}>Current Streak: 7 Days</div>
        </div>

        <div className="prog-hero-card">
          <div className="prog-hero-icon-wrap" style={{ background: C.tealLight, borderColor: 'rgba(20,184,166,0.3)' }}>{Icon.zap()}</div>
          <div className="prog-hero-label">Learning Velocity</div>
          <div className="prog-hero-value">1.8x</div>
          <div className="prog-hero-trend">Faster improvement vs last mo.</div>
        </div>

        <div className="prog-hero-card">
          <div className="prog-hero-icon-wrap" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>{Icon.clock()}</div>
          <div className="prog-hero-label">Avg Solve Time</div>
          <div className="prog-hero-value" style={{ color: C.text }}>14<span style={{ fontSize: '1.4rem' }}>m</span></div>
          <div className="prog-hero-trend" style={{ color: C.muted }}>1.2 attempts per problem</div>
        </div>
      </div>

      {/* ── Row 2: Difficulty Rings & Weekly Goal & Needs Attention (OLD BEST) ── */}
      <div className="prog-row-3col">
        {/* Difficulty Breakdown */}
        <div className="prog-chart-card">
          <div className="prog-chart-header">
            <h3 className="prog-chart-title">Difficulty Breakdown</h3>
            <span className="prog-chart-meta">Total solved</span>
          </div>
          <div className="prog-difficulty">
            {difficultyData.map((d) => {
              const pct = Math.round((d.solved / d.total) * 100);
              return (
                <div key={d.label} className="prog-diff-item">
                  <Ring pct={pct} color={d.color} size={64} stroke={5} label={`${pct}%`} />
                  <div className="prog-diff-info">
                    <span className="prog-diff-label" style={{ color: d.color }}>{d.label}</span>
                    <span className="prog-diff-val">{d.solved}<span className="prog-diff-total">/{d.total}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Goal Tracker */}
        <div className="prog-chart-card">
          <div className="prog-chart-header">
            <h3 className="prog-chart-title">Weekly Goal</h3>
            <span className="prog-chart-badge" style={{ color: C.teal, borderColor: 'rgba(20,184,166,0.3)' }}>
              {Icon.goal()} &nbsp;{weekDone}/{weekGoal} days
            </span>
          </div>
          <div className="prog-week-days">
            {weekDays.map((day, i) => {
              const done = i < weekDone;
              const today = i === weekDone;
              return (
                <div key={day} className={`prog-day-col ${done ? 'done' : ''} ${today ? 'today' : ''}`}>
                  <div className="prog-day-dot" style={{
                    background: done ? C.teal : 'rgba(255,255,255,0.05)',
                    boxShadow: done ? `0 0 10px rgba(20,184,166,0.3)` : 'none'
                  }} />
                  <span className="prog-day-lbl">{day}</span>
                </div>
              );
            })}
          </div>
          <div className="prog-week-bar-bg">
            <div className="prog-week-bar-fill" style={{ width: `${(weekDone / weekGoal) * 100}%` }} />
          </div>
          <p className="prog-week-note">
            {weekGoal - weekDone > 0
              ? `${weekGoal - weekDone} more ${weekGoal - weekDone === 1 ? 'day' : 'days'} to hit your weekly goal`
              : `Weekly goal complete!`}
          </p>
        </div>

        {/* Weak Topics (Text Only - Fixed Layout) */}
        <div className="prog-chart-card">
          <div className="prog-chart-header">
            <h3 className="prog-chart-title">Needs Attention</h3>
            <span className="prog-chart-badge" style={{ color: C.hard, borderColor: 'rgba(239,68,68,0.25)' }}>
              {Icon.alert(C.hard)} &nbsp;Weak areas
            </span>
          </div>
          <div className="prog-weak-list">
            {weakTopics.map(t => (
              <div key={t.topic} className="prog-weak-row">
                <div className="prog-weak-info">
                  <span className="prog-weak-topic">{t.topic}</span>
                  <span className="prog-weak-since">Last practiced {t.lastSeen}</span>
                </div>
                <span className="prog-weak-stat" style={{ color: t.pct < 25 ? C.hard : C.medium }}>{t.pct}% mastery</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Practice Consistency & Topic Mastery Profile (NEW HYBRID) ── */}
      <div className="prog-row-3">
        {/* Heatmap */}
        <div className="prog-chart-card heatmap-card">
          <div className="prog-chart-header">
            <h3 className="prog-chart-title">Practice Consistency</h3>
            <span className="prog-chart-meta">396 contributions in the last 6 months</span>
          </div>
          <div className="heatmap-container">
            <div className="heatmap-grid" style={{ overflowX: 'hidden' }}>
              {heatmapWeeks.map((week, wIdx) => (
                <div key={wIdx} className="heatmap-col">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      className="heatmap-cell"
                      data-level={day.level}
                      data-tooltip={`${day.count} problem${day.count !== 1 ? 's' : ''} solved on ${day.dateStr}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="heatmap-legend">
              <span>Less</span>
              <div className="heatmap-cell" data-level="0" />
              <div className="heatmap-cell" data-level="1" />
              <div className="heatmap-cell" data-level="2" />
              <div className="heatmap-cell" data-level="3" />
              <div className="heatmap-cell" data-level="4" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="prog-chart-card">
          <div className="prog-chart-header">
            <h3 className="prog-chart-title">Topic Mastery Profile</h3>
            <span className="prog-chart-badge" style={{ color: C.amber, borderColor: 'rgba(245,158,11,0.3)' }}>
              Biggest Jump: Strings (+12%)
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData} margin={{ top: 10, bottom: 10 }}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: C.muted, fontSize: 11 }} />
              <Radar name="Mastery" dataKey="A" stroke={C.teal} fill={C.teal} fillOpacity={0.3} dot={{ r: 3, fill: C.teal }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 4: Timeline Charts (Area + Stacked Area) (MIX) ── */}
      <div className="prog-row-2">
        <div className="prog-chart-card">
          <div className="prog-chart-header">
            <h3 className="prog-chart-title">Questions Solved Over Time</h3>
            <span className="prog-chart-badge" style={{ color: C.teal, borderColor: 'rgba(20,184,166,0.3)' }}>
              {Icon.trendingUp()} &nbsp;Upward trend
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={solvedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="solvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Area type="monotone" dataKey="solved" stroke={C.teal} strokeWidth={2}
                fill="url(#solvedGrad)" dot={{ fill: C.teal, r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="prog-chart-card">
          <div className="prog-chart-header">
            <h3 className="prog-chart-title">Difficulty Progression</h3>
            <span className="prog-chart-meta">Questions solved by type</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={solvedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Area type="monotone" dataKey="hard" stackId="1" stroke={C.hard} fill={C.hard} fillOpacity={0.6} />
              <Area type="monotone" dataKey="medium" stackId="1" stroke={C.medium} fill={C.medium} fillOpacity={0.6} />
              <Area type="monotone" dataKey="easy" stackId="1" stroke={C.easy} fill={C.easy} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 5: Categories & Actions (2 cols) ── */}
      <div className="prog-row-2">
        <div className="prog-chart-card">
          <div className="prog-chart-header">
            <h3 className="prog-chart-title">Category Breakdown</h3>
            <span className="prog-chart-meta">Total solved by topic</span>
          </div>
          <div className="prog-categories">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="prog-cat-row">
                <span className="prog-cat-rank">#{i + 1}</span>
                <span className="prog-cat-name">{cat.name}</span>
                <div className="prog-cat-bar-bg">
                  <div className="prog-cat-bar-fill" style={{
                    width: `${cat.pct}%`,
                    background: i % 2 === 0 ? C.teal : 'rgba(20,184,166,0.5)',
                  }} />
                </div>
                <span className="prog-cat-count">{cat.solved}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="prog-chart-card action-card">
          <div className="prog-chart-header">
            <h3 className="prog-chart-title">Recommended Next Steps</h3>
            <span className="prog-chart-meta">Curated for your progression</span>
          </div>
          <div className="action-list">
            {recommendedDocs.map((doc, i) => (
              <div key={i} className="action-item">
                <div className="action-info">
                  <div className="action-type" style={{
                    color: doc.type === 'Video' ? C.amber : C.teal,
                    background: doc.type === 'Video' ? C.amberLight : C.tealLight
                  }}>{doc.type}</div>
                  <span className="action-title">{doc.title}</span>
                </div>
                <div className="action-right">
                  <span className="action-time">{doc.time}</span>
                  <button className="action-btn">{Icon.arrowRight()}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
