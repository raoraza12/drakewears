import React, { useState, useEffect } from 'react';
import './SiteIntroPreloader.css';

export default function SiteIntroPreloader() {
  const [shouldRender, setShouldRender] = useState(true);
  const [stage, setStage] = useState('active'); // 'active' -> 'dissolve' -> 'done'

  const handleSkip = () => {
    setStage('dissolve');
    setTimeout(() => {
      setStage('done');
      setShouldRender(false);
    }, 300);
  };

  useEffect(() => {
    // Stage 1: Frosted Glass Veil over live site with brand name reveal (1.4s)
    const t1 = setTimeout(() => {
      setStage('dissolve');
    }, 1400);

    // Stage 2: Complete dissolution into crystal clear live site (2.0s)
    const t2 = setTimeout(() => {
      setStage('done');
      setShouldRender(false);
    }, 2000);

    // Allow user to press any key to skip immediately
    const handleKeyDown = () => {
      handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown, { once: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!shouldRender || stage === 'done') return null;

  return (
    <div 
      className={`site-intro-overlay stage-${stage}`}
      onClick={handleSkip}
      title="Click anywhere to skip"
    >
      {/* 
        Frosted Glass Veil: 
        100% translucent so the live website underneath is visibly blurred, 
        NEVER an empty white screen!
      */}
      <div className="site-intro-frosted-veil"></div>

      {/* Center Cinematic Brand Name */}
      <div className="site-intro-center-stage">
        <div className="site-intro-pill-badge">
          <span>ATELIER EDITION</span>
        </div>

        <h1 className="site-intro-brand-name">
          DRAKEWEARS
        </h1>

        <div className="site-intro-accent-line"></div>

        <p className="site-intro-tagline">
          CONTEMPORARY STREETWEAR • 2026©
        </p>
      </div>
    </div>
  );
}
