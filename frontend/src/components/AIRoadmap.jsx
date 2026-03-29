import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIRoadmap.css';

const CARD_HOLD_MS = 600;
const LINE_DRAW_MS = 600; 
const FINAL_HOLD_MS = 2500;
const RESET_GAP_MS = 100;

const DEFAULT_STEPS = [
  {
    id: 'n1',
    title: 'Structured Learning Plan',
    tooltip: 'Map core fundamentals, interview topics, and milestones in a focused plan.',
    icon: 'network',
    slot: 1,
  },
  {
    id: 'n2',
    title: 'Skill Analysis',
    tooltip: 'Analyze your abilities through targeted drills and coding challenges.',
    icon: 'keyboard',
    slot: 2,
  },
  {
    id: 'n3',
    title: 'AI Assistance',
    tooltip: 'Get looped feedback from neural mentors, then iterate fast on weak spots.',
    icon: 'feedback',
    slot: 3,
  },
  {
    id: 'n4',
    title: 'Improved Progress',
    tooltip: 'Continuously track your growth and confidently secure your dream offer.',
    icon: 'trophy',
    slot: 4,
  },
];

const ICONS = {
  network: (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="9" cy="12" r="3.5" />
      <circle cx="24" cy="8" r="3.5" />
      <circle cx="39" cy="14" r="3.5" />
      <circle cx="14" cy="34" r="3.5" />
      <circle cx="32" cy="35" r="3.5" />
      <path d="M12 11L20 9M28 9L35 13M11 15L13 30M17 34L28 35M34 18L33 31" />
    </svg>
  ),
  keyboard: (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="6" y="13" width="36" height="22" rx="5" />
      <path d="M12 20h4M18 20h4M24 20h4M30 20h4" />
      <path d="M10 26h4M16 26h4M22 26h4M28 26h4M34 26h4" />
      <path d="M13 31h22" />
    </svg>
  ),
  feedback: (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="14" cy="14" r="3.5" />
      <circle cx="34" cy="14" r="3.5" />
      <path d="M8 24c1-3 4-5 6-5s5 2 6 5" />
      <path d="M28 24c1-3 4-5 6-5s5 2 6 5" />
      <path d="M13 32c4 4 8 4 12 0" />
      <path d="M25 32h6" />
      <path d="M29 29l3 3-3 3" />
      <path d="M35 38c-4 4-8 4-12 0" />
      <path d="M23 38h-6" />
      <path d="M19 35l-3 3 3 3" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M16 8h16v7c0 5-3 9-8 10-5-1-8-5-8-10V8z" />
      <path d="M16 12H10c0 5 2 8 7 9" />
      <path d="M32 12h6c0 5-2 8-7 9" />
      <path d="M24 25v7" />
      <path d="M19 36h10" />
      <path d="M20 32h8v4h-8z" />
    </svg>
  ),
};

const getAnchorPoint = (rect, rootRect, anchor) => {
  switch (anchor) {
    case 'left':
      return { x: rect.left - rootRect.left, y: rect.top - rootRect.top + rect.height / 2 };
    case 'right':
      return { x: rect.right - rootRect.left, y: rect.top - rootRect.top + rect.height / 2 };
    case 'top':
      return { x: rect.left - rootRect.left + rect.width / 2, y: rect.top - rootRect.top };
    case 'bottom':
      return { x: rect.left - rootRect.left + rect.width / 2, y: rect.bottom - rootRect.top };
    default:
      return { x: rect.left - rootRect.left + rect.width / 2, y: rect.top - rootRect.top + rect.height / 2 };
  }
};

const AIRoadmap = ({ steps = DEFAULT_STEPS }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const diagramRef = useRef(null);
  const cardsRef = useRef({});
  const lineRefs = useRef({});
  const timersRef = useRef([]);
  const inViewRef = useRef(false);

  const [isInView, setIsInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [lineLengths, setLineLengths] = useState({ l1: 1, l2: 1, l3: 1 });
  const [paths, setPaths] = useState({ l1: '', l2: '', l3: '' });
  const [viewBox, setViewBox] = useState('0 0 1000 620');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const arePathsReady = useMemo(
    () => Boolean(paths.l1 && paths.l2 && paths.l3),
    [paths]
  );

  const areLengthsReady = useMemo(
    () => lineLengths.l1 > 5 && lineLengths.l2 > 5 && lineLengths.l3 > 5,
    [lineLengths]
  );

  const normalizedSteps = useMemo(
    () => DEFAULT_STEPS.map((base, index) => ({ ...base, ...(steps[index] || {}) })),
    [steps]
  );

  const slots = useMemo(() => {
    const bySlot = {};
    normalizedSteps.forEach((step, index) => {
      bySlot[step.slot || index + 1] = step.id;
    });

    const s1 = bySlot[1] || normalizedSteps[0]?.id;
    const s2 = bySlot[2] || normalizedSteps[1]?.id;
    const s3 = bySlot[3] || normalizedSteps[2]?.id;
    const s4 = bySlot[4] || normalizedSteps[3]?.id;

    return { s1, s2, s3, s4 };
  }, [normalizedSteps]);

  const connections = useMemo(
    () => [
      { 
        id: 'l1', 
        from: slots.s1, 
        to: slots.s2, 
        fromAnchor: isMobile ? 'bottom' : 'right', 
        toAnchor: isMobile ? 'top' : 'left' 
      },
      { 
        id: 'l2', 
        from: slots.s2, 
        to: slots.s3, 
        fromAnchor: 'bottom', 
        toAnchor: 'top' 
      },
      { 
        id: 'l3', 
        from: slots.s3, 
        to: slots.s4, 
        fromAnchor: isMobile ? 'bottom' : 'left', 
        toAnchor: isMobile ? 'top' : 'right' 
      },
    ].filter((line) => line.from && line.to),
    [slots, isMobile]
  );

  const actions = useMemo(
    () => [
      { type: 'card', id: slots.s1 }, 
      { type: 'line', lineId: 'l1' }, 
      { type: 'card', id: slots.s2 }, 
      { type: 'line', lineId: 'l2' }, 
      { type: 'card', id: slots.s3 }, 
      { type: 'line', lineId: 'l3' }, 
      { type: 'card', id: slots.s4 }, 
    ].filter((item) => item.id || item.lineId),
    [slots]
  );

  const clearTimeline = () => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  };

  const buildPathState = () => {
    const root = diagramRef.current;
    if (!root || connections.length === 0) return;

    const rootRect = root.getBoundingClientRect();
    if (rootRect.width === 0 || rootRect.height === 0) return;

    setViewBox(`0 0 ${Math.max(1, Math.round(rootRect.width))} ${Math.max(1, Math.round(rootRect.height))}`);
    const nextPaths = { l1: '', l2: '', l3: '' };

    connections.forEach((line) => {
      const fromEl = cardsRef.current[line.from];
      const toEl = cardsRef.current[line.to];
      if (!fromEl || !toEl) return;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const fromPoint = getAnchorPoint(fromRect, rootRect, line.fromAnchor);
      const toPoint = getAnchorPoint(toRect, rootRect, line.toAnchor);

      nextPaths[line.id] = `M ${fromPoint.x} ${fromPoint.y} L ${toPoint.x} ${toPoint.y}`;
    });

    setPaths(nextPaths);
  };

  const startLoop = () => {
    clearTimeline();
    setActiveIndex(-1);

    const run = (index) => {
      if (!inViewRef.current) return;

      setActiveIndex(index);

      const isLastAction = index === actions.length - 1;
      const delay = isLastAction
        ? FINAL_HOLD_MS
        : actions[index].type === 'line'
        ? LINE_DRAW_MS
        : CARD_HOLD_MS;

      const timer = window.setTimeout(() => {
        if (!inViewRef.current) return;

        if (isLastAction) {
          setActiveIndex(-1);
          const restartTimer = window.setTimeout(() => {
            if (!inViewRef.current) return;
            run(0);
          }, RESET_GAP_MS);
          timersRef.current.push(restartTimer);
        } else {
          run(index + 1);
        }
      }, delay);

      timersRef.current.push(timer);
    };

    if (actions.length > 0) {
      run(0);
    }
  };

  const handleMouseMove = (e) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    target.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = (e) => {
    const target = e.currentTarget;
    target.style.setProperty('--mouse-x', '50%');
    target.style.setProperty('--mouse-y', '50%');
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsInView(visible);
        inViewRef.current = visible;
      },
      { threshold: 0.32 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [connections]);

  useEffect(() => {
    let rafId = 0;
    const queueBuild = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        buildPathState();
        rafId = 0;
      });
    };

    queueBuild();
    const onResize = () => queueBuild();
    window.addEventListener('resize', onResize);

    const observer = new ResizeObserver(() => queueBuild());
    if (diagramRef.current) observer.observe(diagramRef.current);
    Object.values(cardsRef.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [connections]);

  useEffect(() => {
    // Aggressive re-calculation to prevent misplaced lines
    const times = [0, 100, 300, 600, 1000];
    const timers = times.map(ms => window.setTimeout(buildPathState, ms));
    return () => timers.forEach(t => window.clearTimeout(t));
  }, [normalizedSteps, connections]);

  useEffect(() => {
    const safeLength = (el) => {
      try {
        return el?.getTotalLength?.() || 1;
      } catch {
        return 1;
      }
    };

    const lengths = {
      l1: safeLength(lineRefs.current.l1),
      l2: safeLength(lineRefs.current.l2),
      l3: safeLength(lineRefs.current.l3),
    };
    setLineLengths(lengths);
  }, [paths]);

  useEffect(() => {
    if (!isInView) {
      clearTimeline();
      setActiveIndex(-1);
      return;
    }

    if (!arePathsReady || !areLengthsReady) {
      return;
    }

    startLoop();
    return () => clearTimeline();
  }, [isInView, actions, arePathsReady, areLengthsReady]);


  const isNodeActive = (id) => {
    if (activeIndex < 0) return false;
    const cardPhase = actions.findIndex((action) => action.type === 'card' && action.id === id);
    return cardPhase !== -1 && activeIndex >= cardPhase;
  };

  const getLineState = (lineId) => {
    if (activeIndex < 0) return { drawing: false, done: false };
    const linePhase = actions.findIndex((action) => action.type === 'line' && action.lineId === lineId);
    const drawing = linePhase === activeIndex;
    const done = linePhase !== -1 && activeIndex > linePhase;
    return { drawing, done };
  };

  const lineStyle = (lineId) => {
    const length = lineLengths[lineId] || 1;
    const state = getLineState(lineId);

    if (state.drawing) {
      return {
        strokeDasharray: `${length}px`,
        strokeDashoffset: `${length}px`,
        animation: `drawPath ${LINE_DRAW_MS}ms ease-in-out forwards`,
      };
    }

    if (state.done) {
      return {
        strokeDasharray: `${length}px`,
        strokeDashoffset: '0px',
      };
    }

    return {
      strokeDasharray: `${length}px`,
      strokeDashoffset: `${length}px`,
    };
  };

  return (
    <section
      className="ai-roadmap"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <header className="ai-roadmap__header">
        <h2>PERSONALIZED ROADMAPS</h2>
        <p>Create a custom learning path based on your schedule and skill level.</p>
         </header>
      <div className="roadmap-container" ref={diagramRef}>
        <svg className="connector-lines" viewBox={viewBox} aria-hidden="true">
          <defs>
            {/* Added gradientUnits to fix invisible vertical/horizontal lines */}
            <linearGradient id="roadmap-signal" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Path 1 */}
          <path ref={(el) => { lineRefs.current.l1 = el; }} d={paths.l1} className="line-base" />
          <path
            key={`l1-${getLineState('l1').drawing}`}
            d={paths.l1}
            className="line-active"
            style={lineStyle('l1')}
          />

          {/* Path 2 */}
          <path ref={(el) => { lineRefs.current.l2 = el; }} d={paths.l2} className="line-base" />
          <path
            key={`l2-${getLineState('l2').drawing}`}
            d={paths.l2}
            className="line-active"
            style={lineStyle('l2')}
          />

          {/* Path 3 */}
          <path ref={(el) => { lineRefs.current.l3 = el; }} d={paths.l3} className="line-base" />
          <path
            key={`l3-${getLineState('l3').drawing}`}
            d={paths.l3}
            className="line-active"
            style={lineStyle('l3')}
          />
        </svg>

        {normalizedSteps.map((card) => (
          <article
            key={card.id}
            ref={(el) => {
              cardsRef.current[card.id] = el;
            }}
            className={`step-card step-card--${card.slot || 1} ${isNodeActive(card.id) ? 'is-active' : ''} ${activeIndex === 6 && card.id === slots.s4 ? 'active-final' : ''}`}
          >
            <div className="step-card__icon">{ICONS[card.icon] || ICONS.network}</div>
            <h3>{card.title}</h3>
          </article>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem', position: 'relative', zIndex: 10 }}>
        <button 
          className="btn-primary"
          style={{ borderRadius: '999px', padding: '0.85rem 2.8rem', fontSize: '1rem', fontWeight: 700 }}
          onClick={() => navigate('/learning-plans')}
        >
          Start your journey
        </button>
      </div>
    </section>
  );
};

export default AIRoadmap;
