import React from 'react';
import './About.css';

const values = [
  {
    title: 'Personalization First',
    text: 'Every learner has different goals and time constraints. We adapt plans to your context, not generic templates.',
  },
  {
    title: 'Actionable Intelligence',
    text: 'Insights are useful only when they lead to action. We turn progress data into clear next steps.',
  },
  {
    title: 'Consistent Growth',
    text: 'Small, focused wins each week compound into strong interview performance and career confidence.',
  },
];

export default function About() {
  return (
    <main className="about-page page-container">
      <section className="about-hero page-content">
        <p className="about-kicker">About LearnPath AI</p>
        <h1 className="page-title">A practical learning companion for modern developers.</h1>
        <p className="about-summary">
          LearnPath AI helps you identify skill gaps, prioritize what matters next, and follow a structured
          path from current level to target role.
        </p>
      </section>

      <section className="about-grid">
        {values.map((item) => (
          <article className="about-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="about-mission page-content">
        <h2>Our Mission</h2>
        <p>
          Remove learning noise and replace it with clarity. We believe focused practice, meaningful feedback,
          and progress visibility can radically improve how people grow in tech.
        </p>
      </section>

      <section className="about-team page-content" style={{ marginTop: '4rem', paddingBottom: '4rem' }}>
        <h2>Contributors</h2>
        <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem' }}>The people building and shaping the LearnPath AI experience.</p>
        <div className="contributors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          <div className="about-glass-card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>Nithin K</h3>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Contributor</p>
          </div>

          <div className="about-glass-card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>Karthik Lateral</h3>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Contributor</p>
          </div>

          <div className="about-glass-card">
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>Nishit SK</h3>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Contributor</p>
          </div>

          <div style={{ background: 'var(--paper-soft)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>S@mith</h3>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Contributor</p>
          </div>

          <div style={{ background: 'var(--paper-soft)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>Yishith Vilas</h3>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Contributor</p>
          </div>

          <div style={{ background: 'var(--paper-soft)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>Shattu</h3>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Contributor</p>
          </div>

        </div>
      </section>
    </main>
  );
}
