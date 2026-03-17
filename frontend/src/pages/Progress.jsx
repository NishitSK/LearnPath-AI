import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend
} from 'recharts';
import { useAuth } from '@clerk/clerk-react';
import './Pages.css';
import './Progress.css';

const API_BASE = 'http://localhost:3000';
const CATEGORY_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#4f46e5'];

const PROBLEM_TO_CATEGORY = {
  'Two Sum': 'Arrays',
  'Valid Palindrome': 'Strings',
  'Reverse Linked List': 'Linked List',
  'Climbing Stairs': 'DP',
  'Maximum Subarray': 'Arrays',
  'Binary Search': 'Binary Search',
};

function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayLabel(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function weekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calcStreaks(dates) {
  if (dates.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const uniqueDays = [...new Set(dates.map((d) => dayKey(d)))].sort();
  let best = 1;
  let curr = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const now = new Date(uniqueDays[i]);
    const diffDays = Math.round((now - prev) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      curr += 1;
      best = Math.max(best, curr);
    } else {
      curr = 1;
    }
  }

  const today = dayKey(new Date());
  let currentStreak = 0;
  let cursor = new Date(today);
  while (uniqueDays.includes(dayKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { currentStreak, bestStreak: best };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} className="tooltip-val" style={{ color: entry.color || '#a78bfa' }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Progress() {
  const { isSignedIn, getToken } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!isSignedIn) {
        setLoading(false);
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
          throw new Error(data?.error || 'Failed to fetch progress data.');
        }
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Unable to load progress.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isSignedIn, getToken]);

  const solvedData = useMemo(() => {
    const last10 = [...Array(10)].map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (9 - idx));
      return d;
    });

    const dayCount = submissions.reduce((acc, s) => {
      const key = dayKey(s.createdAt || new Date());
      if (!acc[key]) {
        acc[key] = { solved: 0, codingSolved: 0 };
      }
      acc[key].solved += 1;
      if (s.submissionType === 'coding') {
        acc[key].codingSolved += 1;
      }
      return acc;
    }, {});

    return last10.map((d) => {
      const key = dayKey(d);
      return {
        day: dayLabel(d),
        solved: dayCount[key]?.solved || 0,
        codingSolved: dayCount[key]?.codingSolved || 0,
      };
    });
  }, [submissions]);

  const weeklyStreak = useMemo(() => {
    const weekCount = submissions.reduce((acc, s) => {
      const key = dayKey(weekStart(s.createdAt || new Date()));
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const sortedWeeks = Object.keys(weekCount).sort().slice(-6);
    return sortedWeeks.map((k, i) => ({ week: `W${i + 1}`, streak: weekCount[k] }));
  }, [submissions]);

  const categoryData = useMemo(() => {
    const coding = submissions.filter((s) => s.submissionType === 'coding');
    const catCount = coding.reduce((acc, s) => {
      const category = PROBLEM_TO_CATEGORY[s.problemTitle] || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(catCount)
      .map(([name, solved], idx) => ({ name, solved, color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }))
      .sort((a, b) => b.solved - a.solved)
      .slice(0, 6);
  }, [submissions]);

  const quizStats = useMemo(() => {
    const quiz = submissions.filter((s) => s.submissionType === 'quiz');
    const score = quiz.reduce((sum, q) => sum + (q.score || 0), 0);
    const total = quiz.reduce((sum, q) => sum + (q.totalQuestions || 0), 0);
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    return { accuracy };
  }, [submissions]);

  const codingSolvedCount = useMemo(
    () => submissions.filter((s) => s.submissionType === 'coding').length,
    [submissions]
  );

  const { currentStreak, bestStreak } = useMemo(
    () => calcStreaks(submissions.map((s) => s.createdAt || new Date())),
    [submissions]
  );

  const totalSolved = submissions.length;

  return (
    <div className="page-container">
      <h1 className="page-title">Growth Analytics</h1>

      {loading && <div className="page-content" style={{ marginBottom: '1rem' }}>Loading progress...</div>}
      {error && <div className="page-content" style={{ marginBottom: '1rem', color: '#f87171' }}>{error}</div>}
      {!isSignedIn && <div className="page-content" style={{ marginBottom: '1rem' }}>Sign in to view your progress analytics.</div>}

      {/* Stat Cards */}
      <div className="prog-stats">
        {[
          { label: 'Total Submissions', value: totalSolved, icon: 'S', color: '#22c55e' },
          { label: 'Code Solved', value: codingSolvedCount, icon: 'C', color: '#06b6d4' },
          { label: 'Current Streak', value: `${currentStreak} days`, icon: 'C', color: '#f59e0b' },
          { label: 'Best Streak', value: `${bestStreak} days`, icon: 'B', color: '#8b5cf6' },
          { label: 'Quiz Accuracy', value: `${quizStats.accuracy}%`, icon: 'A', color: '#6366f1' },
        ].map((stat) => (
          <div key={stat.label} className="prog-stat-card">
            <span className="prog-stat-icon">{stat.icon}</span>
            <div>
              <div className="prog-stat-val" style={{ color: stat.color }}>{stat.value}</div>
              <div className="prog-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Questions Solved Over Time */}
      <div className="prog-chart-card">
        <h3 className="prog-chart-title">Questions Solved Over Time (Total vs Code Editor)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={solvedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="solvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="codingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" name="Total Solved" dataKey="solved" stroke="#8b5cf6" strokeWidth={2.2} fill="url(#solvedGrad)" dot={{ fill: '#8b5cf6', r: 3 }} activeDot={{ r: 6 }} />
            <Area type="monotone" name="Code Solved" dataKey="codingSolved" stroke="#06b6d4" strokeWidth={2.2} fill="url(#codingGrad)" dot={{ fill: '#06b6d4', r: 3 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="prog-row">
        {/* Weekly Streak */}
        <div className="prog-chart-card" style={{ flex: 1 }}>
          <h3 className="prog-chart-title">Weekly Streak</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyStreak} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="streak" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="prog-chart-card" style={{ flex: 1 }}>
          <h3 className="prog-chart-title">Category Breakdown</h3>
          <div className="prog-categories">
            {categoryData.length === 0 && <div style={{ color: '#6b7280' }}>No coding submissions yet.</div>}
            {categoryData.map((cat) => {
              const max = Math.max(...categoryData.map((c) => c.solved));
              return (
                <div key={cat.name} className="prog-cat-row">
                  <span className="prog-cat-name">{cat.name}</span>
                  <div className="prog-cat-bar-bg">
                    <div className="prog-cat-bar-fill" style={{ width: `${(cat.solved / max) * 100}%`, background: cat.color }} />
                  </div>
                  <span className="prog-cat-count">{cat.solved}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
