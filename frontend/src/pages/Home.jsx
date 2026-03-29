import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import CardSwap, { Card } from '../components/CardSwap/CardSwap';
import AIRoadmap from '../components/AIRoadmap';
import BentoGrid from '../components/BentoGrid';
import TechStackMarquee from '../components/TechStackMarquee';
import AdaptiveParallax from '../components/AdaptiveParallax';
import './Home.css';

const Home = () => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleGetStarted = () => {
    navigate('/assessments');
  };

  const handleExplore = () => {
    navigate(isSignedIn ? '/learning-plans' : '/about');
  };

  if (!isLoaded) return null;

  const isMobile = viewportWidth <= 900;
  const cardWidth = isMobile ? Math.max(240, Math.min(340, viewportWidth - 36)) : 600;
  const cardHeight = isMobile ? Math.round(cardWidth * 0.58) : 338;
  const cardDistance = isMobile ? Math.max(14, Math.round(cardWidth * 0.06)) : 35;
  const verticalDistance = isMobile ? Math.max(22, Math.round(cardWidth * 0.11)) : 45;

  return (
    <div className="home-page min-h-screen text-white overflow-hidden font-sans">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

      <div className="home-content-wrap relative z-10 w-full">
        {/* ✨ New Hero Section featuring CardSwap */}
        <div className="home-hero-layout">
          
          {/* Left text content */}
          <div className="home-hero-copy">
            <h1 className="home-hero-title">
              Learn <span className="brand-gradient">differently.</span>
            </h1>
            
            <p className="home-hero-subtitle">
              Stop following generic tutorials. Immerse yourself in a dynamic, AI-driven curriculum that adapts to your unique goals and learning style.
            </p>
            
            <div className="home-hero-cta-row">
              {!isSignedIn && (
                <button 
                  className="btn-primary" 
                  style={{ padding: '0.8rem 1.75rem', fontSize: '1rem', borderRadius: '9999px' }}
                  onClick={handleGetStarted}
                >
                  Get Started Now
                </button>
              )}
              <button 
                className="btn-secondary" 
                style={{ padding: '0.8rem 1.75rem', fontSize: '1rem', borderRadius: '9999px' }}
                onClick={handleExplore}
              >
                {isSignedIn ? 'Explore' : 'View Paths'}
              </button>
            </div>
          </div>

          {/* Right side Card Swap component */}
          <div className="home-hero-cards">
            <div className="home-card-swap-frame">
              <CardSwap
                cardDistance={cardDistance}
                verticalDistance={verticalDistance}
                delay={6000}
                pauseOnHover={true}
                width={cardWidth}
                height={cardHeight}
                duration={2.5}
              >
              {/* 1st Card: Code Editor Video */}
              <Card style={{ backgroundColor: '#11111b', border: '1px solid #2a2a35', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                {/* Window Title Bar */}
                <div style={{ width: '100%', height: '36px', borderBottom: '1px solid #2a2a35', backgroundColor: '#12121c', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.5rem' }}>Skills Assessment</span>
                </div>
                {/* Video Content Area */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <video src="/video/assessment-preview.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </Card>

              {/* 2nd Card: Quiz Video */}
              <Card style={{ backgroundColor: '#11111b', border: '1px solid #2a2a35', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                {/* Window Title Bar */}
                <div style={{ width: '100%', height: '36px', borderBottom: '1px solid #2a2a35', backgroundColor: '#12121c', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.5rem' }}>Interactive Quiz</span>
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <video src="/video/quiz-interaction.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </Card>

              {/* 3rd Card: Learning Plan Video */}
              <Card style={{ backgroundColor: '#11111b', border: '1px solid #2a2a35', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                {/* Window Title Bar */}
                <div style={{ width: '100%', height: '36px', borderBottom: '1px solid #2a2a35', backgroundColor: '#12121c', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.4rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.5rem' }}>Personalized Plans</span>
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <video src="/video/learning-path.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </Card>
              </CardSwap>
            </div>
          </div>
        </div>

        {/* 🔄 Interactive Roadmap Section */}
        <div className="pb-16 pt-8">
          <AIRoadmap />
        </div>

        {/* 🍱 AI Engine Bento Grid Section */}
        <BentoGrid />

        {/* ♾️ Infinite Tech Stack Marquee Section */}
        <TechStackMarquee />

        {/* 🔮 Adaptive Assessment Parallax Section */}
        <AdaptiveParallax />
      </div>
    </div>
  );
};

export default Home;
