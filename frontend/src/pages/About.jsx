import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const values = [
  {
    title: 'Personalization First',
    text: 'Every learner has different goals and time constraints. We adapt plans to your context, not generic templates.',
    icon: '🎯'
  },
  {
    title: 'Actionable Intelligence',
    text: 'Insights are useful only when they lead to action. We turn progress data into clear next steps.',
    icon: '⚡'
  },
  {
    title: 'Consistent Growth',
    text: 'Small, focused wins each week compound into strong interview performance and career confidence.',
    icon: '📈'
  },
];

const contributors = [
  { name: 'Nithin K', role: 'Core Contributor', instagram: 'https://www.instagram.com/nithinkdesign/' },
  { name: 'Karthik ', role: 'Core Contributor', instagram: 'https://www.instagram.com/karthik.suvarna.18' },
  { name: 'Nishit SK', role: 'Core Contributor', instagram: 'https://www.instagram.com/nishit_sk?igsh=b2p1cHZlZzlkNWl2' },
  { name: 'Samith S Palan', role: 'Core Contributor', instagram: 'https://www.instagram.com/samith_s_/' },
  { name: 'Yishith Vilas', role: 'Core Contributor', instagram: 'https://www.instagram.com/yishith_vilas' },
  { name: 'Shathananda', role: 'Core Contributor', instagram: 'https://www.instagram.com/shathananda_murudittaya/' },
];

export default function About() {
  const InstagramIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );

  return (
    <main className="about-page page-container">
      <motion.section 
        className="about-hero page-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="about-kicker">About LearnPath AI</p>
        <h1 className="page-title">A practical learning companion for modern developers.</h1>
        <p className="about-summary">
          LearnPath AI helps you identify skill gaps, prioritize what matters next, and follow a structured
          path from current level to target role. We're on a mission to make career growth predictable and accessible.
        </p>
      </motion.section>

      <section className="about-grid">
        {values.map((item, index) => (
          <motion.article 
            className="about-card" 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="card-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </motion.article>
        ))}
      </section>

      <motion.section 
        className="about-mission page-content"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            Remove learning noise and replace it with clarity. We believe focused practice, meaningful feedback,
            and progress visibility can radically improve how people grow in tech. Our platform is built around the 
            principle of deliberate practice and measurable outcomes.
          </p>
        </div>
      </motion.section>

      <section className="about-team page-content">
        <div className="team-header">
          <h2>Our Team</h2>
          <p>The brilliant minds building and shaping the LearnPath AI experience.</p>
        </div>
        
        <div className="contributors-grid">
          {contributors.map((person, index) => (
            <motion.div 
              key={person.name} 
              className="contributor-card"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <div className="contributor-info">
                <h3>{person.name}</h3>
                <p>{person.role}</p>
              </div>
              <a 
                href={person.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="instagram-link"
                title={`Follow ${person.name} on Instagram`}
              >
                <InstagramIcon />
              </a>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}

