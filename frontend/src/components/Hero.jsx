import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import StrokeLogoLoader from './StrokeLogoLoader';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="headline">
          Master Your <br />
          Career with <span className="highlight">AI-</span><br />
          <span className="highlight">Driven Mastery</span>
        </h1>
        <p className="subheadline">
          Experience a premium educational journey powered by neural intelligence.
          <span className="brand-gradient"> LearnPath AI </span>reconstructs your professional roadmap through continuous assessment and real-time adaptation.
        </p>
        
        <div className="hero-actions">
          <SignedOut>
            <SignInButton mode="modal" fallbackRedirectUrl="/learning-plans?auth=login" forceRedirectUrl="/learning-plans?auth=login" signUpFallbackRedirectUrl="/learning-plans?auth=login">
              <button className="btn-primary">Start Your Journey</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <button className="btn-primary" onClick={() => navigate('/progress')}>
              Explore Features
            </button>
          </SignedIn>
        </div>

      </div>

      <div className="hero-visual">
        <div className="visual-card">
          <div className="brain-loader">
             <div className="hero-logo-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <StrokeLogoLoader size={90} gradient={true} />
             </div>
             <svg className="loader-ring" viewBox="0 0 100 100">
               <defs>
                 <linearGradient id="ring-grad" x1="0" y1="0" x2="100" y2="100">
                   <stop offset="0%" stopColor="#7c3aed" />
                   <stop offset="100%" stopColor="#06b6d4" />
                 </linearGradient>
               </defs>
               <circle cx="50" cy="50" r="48" stroke="url(#ring-grad)" />
             </svg>
          </div>
          <div className="processing-text">NEURAL_PROCESSING_ACTIVE</div>
          <div className="loading-bar">
             <div className="bar-fill"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
