import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src="/logo.png" alt="LearnPath AI" />
          <div>
            <h4>LearnPath AI</h4>
            <p>Adaptive roadmaps for focused developer growth. Crafting the next generation of engineers with AI-driven, highly personalized, and brutalist-flavored learning journeys.</p>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-column">
            <h5>Platform</h5>
            <Link to="/">Home</Link>
            <Link to="/learning-plans">Pathways</Link>
            <Link to="/assessments">Assessments</Link>
            <Link to="/progress">Progress</Link>
          </div>
          
          <div className="footer-column">
            <h5>Company</h5>
            <Link to="/about">About Us</Link>
            <a href="#careers">Careers</a>
            <a href="#blog">Blog</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-column">
            <h5>Legal</h5>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">© {new Date().getFullYear()} LearnPath AI.</p>
        <p className="footer-tagline">Built for intentional learning. Open Source & Proud.</p>
      </div>
    </footer>
  );
}
