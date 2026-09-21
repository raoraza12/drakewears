import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlay, FiRotateCcw, FiCheck, FiMaximize2, FiX } from 'react-icons/fi';
import './AnimationDemos.css';

const DEMOS = [
  {
    id: 5,
    name: 'Frosted Glass & Black Script Logo (Aapka Concept)',
    vibe: 'Celine / Saint Laurent / Minimal Luxury',
    tagline: 'Site background heavily blurred in real-time, exact black signature drakewears script logo reveals, then blur dissolves into sharp site focus',
    duration: 1900,
    accent: '#000000',
    isFeatured: true,
  },
  {
    id: 1,
    name: 'The Luxury Monolith',
    vibe: 'Balenciaga / Fear of God / Essentials',
    tagline: 'High-Fashion Editorial Letter Tracking with Metallic Light Sweep & Shutter Lift',
    duration: 1800,
    accent: '#D4AF37',
  },
  {
    id: 2,
    name: 'Split Curtain VIP Doors',
    vibe: 'Represent Clo / Kith Flagship',
    tagline: 'Masked Slide-up Typography with Minimalist Progress Sweep and Dual Split Doors',
    duration: 1700,
    accent: '#FFFFFF',
  },
  {
    id: 3,
    name: 'Laser Outline & Glow Fill',
    vibe: 'Off-White / Trapstar Urban Streetwear',
    tagline: 'Neon Laser Stroke Drawing, Sudden Soft Bloom Pulse, and Camera Zoom-through',
    duration: 1800,
    accent: '#38BDF8',
  },
  {
    id: 4,
    name: 'Cyber Kinetic Scramble',
    vibe: 'Tech Streetwear / Japanese Hypebeast',
    tagline: 'Real-time Matrix Character Decryption into Bold DRAKEWEARS with Shutter Wipe',
    duration: 1500,
    accent: '#10B981',
  },
];

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?';

export default function AnimationDemos() {
  const [activeDemo, setActiveDemo] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrambleText, setScrambleText] = useState('DRAKEWEARS');
  const [splitStage, setSplitStage] = useState('enter'); // 'enter', 'sweep', 'exit'
  const [monolithStage, setMonolithStage] = useState('enter'); // 'enter', 'shine', 'exit'
  const [laserStage, setLaserStage] = useState('draw'); // 'draw', 'fill', 'exit'
  const [frostedStage, setFrostedStage] = useState('blur'); // 'blur', 'logo', 'dissolve'
  const [keyTrigger, setKeyTrigger] = useState(0);

  // Trigger animation replay
  const triggerAnimation = (demoId, fullscreen = false) => {
    setActiveDemo(demoId);
    setIsFullscreen(fullscreen);
    setIsPlaying(true);
    setKeyTrigger((prev) => prev + 1);
  };

  // Demo 4: Scramble effect logic
  useEffect(() => {
    if (activeDemo === 4 && isPlaying) {
      const target = 'DRAKEWEARS';
      let iteration = 0;
      const interval = setInterval(() => {
        setScrambleText(
          target
            .split('')
            .map((char, index) => {
              if (index < iteration) return target[index];
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join('')
        );

        if (iteration >= target.length) {
          clearInterval(interval);
        }
        iteration += 1 / 2.5;
      }, 40);

      return () => clearInterval(interval);
    }
  }, [activeDemo, isPlaying, keyTrigger]);

  // Handle stage progressions for active demo
  useEffect(() => {
    if (!isPlaying) return;

    if (activeDemo === 5) {
      setFrostedStage('blur');
      const t1 = setTimeout(() => setFrostedStage('logo'), 200);
      const t2 = setTimeout(() => setFrostedStage('dissolve'), 1600);
      const t3 = setTimeout(() => {
        setIsPlaying(false);
        setIsFullscreen(false);
      }, 2400);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }

    if (activeDemo === 1) {
      setMonolithStage('enter');
      const t1 = setTimeout(() => setMonolithStage('shine'), 400);
      const t2 = setTimeout(() => setMonolithStage('exit'), 1600);
      const t3 = setTimeout(() => {
        setIsPlaying(false);
        setIsFullscreen(false);
      }, 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }

    if (activeDemo === 2) {
      setSplitStage('enter');
      const t1 = setTimeout(() => setSplitStage('sweep'), 300);
      const t2 = setTimeout(() => setSplitStage('exit'), 1400);
      const t3 = setTimeout(() => {
        setIsPlaying(false);
        setIsFullscreen(false);
      }, 2100);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }

    if (activeDemo === 3) {
      setLaserStage('draw');
      const t1 = setTimeout(() => setLaserStage('fill'), 800);
      const t2 = setTimeout(() => setLaserStage('exit'), 1500);
      const t3 = setTimeout(() => {
        setIsPlaying(false);
        setIsFullscreen(false);
      }, 2100);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }

    if (activeDemo === 4) {
      const t2 = setTimeout(() => {
        setIsPlaying(false);
        setIsFullscreen(false);
      }, 2000);
      return () => clearTimeout(t2);
    }
  }, [activeDemo, isPlaying, keyTrigger]);

  // Initial trigger on load
  useEffect(() => {
    triggerAnimation(5, false);
  }, []);

  return (
    <div className="demo-showcase-page">
      {/* Top Header Bar */}
      <header className="demo-header">
        <div className="demo-header-left">
          <Link to="/" className="back-link">
            ← Back to Store
          </Link>
          <span className="demo-badge">LIVE INTERACTIVE SHOWCASE</span>
        </div>
        <h1 className="demo-title">DRAKEWEARS Site Opening Animations</h1>
        <p className="demo-subtitle">
          Neeche diye gaye 4 styles mein se click karke live animation check karein. 
          Aap <strong>"Play Fullscreen"</strong> button daba kar bilkul live screen experience bhi dekh saktay hain.
        </p>
      </header>

      {/* Main Grid: Left Controls & Details, Right Interactive Screen */}
      <div className="demo-workspace">
        {/* Style Selector Buttons */}
        <div className="demo-sidebar">
          <h3>Choose Animation Style</h3>
          <div className="demo-options-list">
            {DEMOS.map((demo) => (
              <div
                key={demo.id}
                className={`demo-card-item ${activeDemo === demo.id ? 'active' : ''}`}
                onClick={() => triggerAnimation(demo.id, false)}
              >
                <div className="demo-card-header">
                  <span className="demo-num">0{demo.id}</span>
                  <span className="demo-vibe-tag">{demo.vibe.split('/')[0]}</span>
                </div>
                <h4>{demo.name}</h4>
                <p className="demo-desc">{demo.tagline}</p>
                <div className="demo-card-footer">
                  <span className="demo-duration">Speed: ~{(demo.duration / 1000).toFixed(1)}s</span>
                  {activeDemo === demo.id && <span className="active-pill"><FiCheck /> Selected</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="sidebar-action-box">
            <button 
              className="btn-replay"
              onClick={() => triggerAnimation(activeDemo, false)}
            >
              <FiRotateCcw /> Replay Current
            </button>
            <button 
              className="btn-fullscreen-play"
              onClick={() => triggerAnimation(activeDemo, true)}
            >
              <FiMaximize2 /> Play Fullscreen (True Preview)
            </button>
          </div>
        </div>

        {/* Interactive Preview Canvas */}
        <div className="demo-stage-wrapper">
          <div className="stage-top-bar">
            <div className="stage-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="stage-url-bar">
              https://drakewears.com <span className="stage-tag">— [{DEMOS.find(d => d.id === activeDemo)?.name}]</span>
            </div>
            <button 
              className="stage-replay-icon-btn" 
              title="Replay"
              onClick={() => triggerAnimation(activeDemo, false)}
            >
              <FiRotateCcw />
            </button>
          </div>

          {/* The Actual Animation Frame */}
          <div className={`demo-stage-screen stage-demo-${activeDemo}`}>
            {/* Mock background site that gets revealed under the animation */}
            <div className="mock-site-backdrop">
              <div className="mock-site-nav">
                <span className="mock-logo">DRAKEWEARS</span>
                <span className="mock-nav-links">SHOP • NEW DROPS • COLLECTIONS • ABOUT</span>
              </div>
              <div className="mock-hero-content">
                <span className="mock-pill">NEW SEASON 2025</span>
                <h2>STREETWEAR REDEFINED</h2>
                <p>Oversized hoodies, heavy cotton tees & signature baggy pants.</p>
                <div className="mock-cta">EXPLORE COLLECTION →</div>
              </div>
            </div>

            {/* Animation Overlay Container */}
            {isPlaying && (
              <div className="animation-overlay-box">
                {/* DEMO 5: FROSTED GLASS & BLACK SCRIPT LOGO (Aapka Concept) */}
                {activeDemo === 5 && (
                  <div className={`anim-frosted-screen stage-${frostedStage}`}>
                    <div className="frosted-glass-backdrop"></div>
                    <div className="frosted-content-box">
                      <div className="frosted-logo-wrap">
                        <img 
                          src="/drakewears-logo.png" 
                          alt="drakewears" 
                          className="frosted-black-logo" 
                        />
                      </div>
                      <div className="frosted-meta-tagline">
                        <span className="frosted-line"></span>
                        <span className="frosted-tag-text">EST. 2024 • LUXURY STREETWEAR</span>
                        <span className="frosted-line"></span>
                      </div>
                      <div className="frosted-loader-track">
                        <div className="frosted-loader-bar"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DEMO 1: LUXURY MONOLITH */}
                {activeDemo === 1 && (
                  <div className={`anim-monolith-curtain stage-${monolithStage}`}>
                    <div className="monolith-content">
                      <div className="monolith-crown">EST. 2024</div>
                      <h2 className="monolith-brand">
                        <span className="monolith-text">D R A K E W E A R S</span>
                        <div className="monolith-shimmer-bar"></div>
                      </h2>
                      <div className="monolith-sub">
                        <span className="monolith-line"></span>
                        <span className="monolith-tag">LUXURY STREETWEAR</span>
                        <span className="monolith-line"></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DEMO 2: SPLIT CURTAIN VIP */}
                {activeDemo === 2 && (
                  <div className={`anim-split-curtain stage-${splitStage}`}>
                    <div className="split-door-left"></div>
                    <div className="split-door-right"></div>
                    <div className="split-center-content">
                      <div className="split-logo-mask">
                        <h2 className="split-brand-text">DRAKEWEARS</h2>
                      </div>
                      <div className="split-progress-track">
                        <div className="split-progress-fill"></div>
                      </div>
                      <div className="split-footer-note">FLAGSHIP ATELIER • PAKISTAN</div>
                    </div>
                  </div>
                )}

                {/* DEMO 3: LASER OUTLINE & GLOW */}
                {activeDemo === 3 && (
                  <div className={`anim-laser-screen stage-${laserStage}`}>
                    <div className="laser-grid-bg"></div>
                    <div className="laser-content">
                      <div className="laser-coords">LAT 31.5204° N // LON 74.3587° E</div>
                      <svg viewBox="0 0 700 90" className="laser-svg">
                        <text
                          x="50%"
                          y="65%"
                          textAnchor="middle"
                          className="laser-svg-text"
                        >
                          DRAKEWEARS
                        </text>
                      </svg>
                      <div className="laser-glow-tag">HEAVYWEIGHT APPAREL</div>
                    </div>
                  </div>
                )}

                {/* DEMO 4: CYBER KINETIC SCRAMBLE */}
                {activeDemo === 4 && (
                  <div className="anim-scramble-screen">
                    <div className="scramble-content">
                      <div className="scramble-header">
                        <span className="scramble-indicator"></span> SYSTEM LOADING...
                      </div>
                      <h2 className="scramble-brand">{scrambleText}</h2>
                      <div className="scramble-meta">
                        <span>DROP 01 // OVERSIZED DROP</span>
                        <span>[PRESS SPACE TO BYPASS]</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN POPUP OVERLAY (Triggered when user clicks "Play Fullscreen") */}
      {isFullscreen && isPlaying && (
        <div className="fullscreen-live-modal">
          <button 
            className="close-fullscreen-btn" 
            onClick={() => { setIsFullscreen(false); setIsPlaying(false); }}
          >
            <FiX /> Exit Fullscreen
          </button>

          {/* DEMO 5: FROSTED GLASS & BLACK SCRIPT LOGO FULLSCREEN */}
          {activeDemo === 5 && (
            <div className={`anim-frosted-screen stage-${frostedStage} fs-mode`}>
              <div className="frosted-glass-backdrop"></div>
              <div className="frosted-content-box">
                <div className="frosted-logo-wrap">
                  <img 
                    src="/drakewears-logo.png" 
                    alt="drakewears" 
                    className="frosted-black-logo" 
                  />
                </div>
                <div className="frosted-meta-tagline">
                  <span className="frosted-line"></span>
                  <span className="frosted-tag-text">EST. 2024 • LUXURY STREETWEAR</span>
                  <span className="frosted-line"></span>
                </div>
                <div className="frosted-loader-track">
                  <div className="frosted-loader-bar"></div>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 1 && (
            <div className={`anim-monolith-curtain stage-${monolithStage} fs-mode`}>
              <div className="monolith-content">
                <div className="monolith-crown">EST. 2024</div>
                <h2 className="monolith-brand">
                  <span className="monolith-text">D R A K E W E A R S</span>
                  <div className="monolith-shimmer-bar"></div>
                </h2>
                <div className="monolith-sub">
                  <span className="monolith-line"></span>
                  <span className="monolith-tag">LUXURY STREETWEAR</span>
                  <span className="monolith-line"></span>
                </div>
              </div>
            </div>
          )}

          {activeDemo === 2 && (
            <div className={`anim-split-curtain stage-${splitStage} fs-mode`}>
              <div className="split-door-left"></div>
              <div className="split-door-right"></div>
              <div className="split-center-content">
                <div className="split-logo-mask">
                  <h2 className="split-brand-text">DRAKEWEARS</h2>
                </div>
                <div className="split-progress-track">
                  <div className="split-progress-fill"></div>
                </div>
                <div className="split-footer-note">FLAGSHIP ATELIER • PAKISTAN</div>
              </div>
            </div>
          )}

          {activeDemo === 3 && (
            <div className={`anim-laser-screen stage-${laserStage} fs-mode`}>
              <div className="laser-grid-bg"></div>
              <div className="laser-content">
                <div className="laser-coords">LAT 31.5204° N // LON 74.3587° E</div>
                <svg viewBox="0 0 700 90" className="laser-svg">
                  <text
                    x="50%"
                    y="65%"
                    textAnchor="middle"
                    className="laser-svg-text"
                  >
                    DRAKEWEARS
                  </text>
                </svg>
                <div className="laser-glow-tag">HEAVYWEIGHT APPAREL</div>
              </div>
            </div>
          )}

          {activeDemo === 4 && (
            <div className="anim-scramble-screen fs-mode">
              <div className="scramble-content">
                <div className="scramble-header">
                  <span className="scramble-indicator"></span> SYSTEM LOADING...
                </div>
                <h2 className="scramble-brand">{scrambleText}</h2>
                <div className="scramble-meta">
                  <span>DROP 01 // OVERSIZED DROP</span>
                  <span>[PRESS ANYWHERE TO CONTINUE]</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
