import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiRotateCw, 
  FiLayers, 
  FiBox, 
  FiMaximize2, 
  FiMove, 
  FiSliders, 
  FiCompass, 
  FiEye,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import './ThreeDShowcase.css';

export default function ThreeDShowcase() {
  const [activeStyle, setActiveStyle] = useState('cube'); // 'cube', 'tunnel', 'chrome', 'monolith', 'deck'
  const [autoRotate, setAutoRotate] = useState(true);

  // ==========================================================
  // STYLE 1: 360° INTERACTIVE 3D ORBIT CUBE STATE
  // ==========================================================
  const [cubeRotation, setCubeRotation] = useState({ x: -12, y: 35 });
  const isDraggingCube = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const currentRot = useRef({ x: -12, y: 35 });

  const handleCubeMouseDown = (e) => {
    isDraggingCube.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    currentRot.current = { ...cubeRotation };
    setAutoRotate(false);
  };

  const handleCubeMouseMove = (e) => {
    if (!isDraggingCube.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const newY = currentRot.current.y + dx * 0.5;
    const newX = Math.max(-60, Math.min(60, currentRot.current.x - dy * 0.4));
    setCubeRotation({ x: newX, y: newY });
  };

  const handleCubeMouseUp = () => {
    isDraggingCube.current = false;
  };

  // Auto spin cube if enabled
  useEffect(() => {
    if (!autoRotate || activeStyle !== 'cube') return;
    const interval = setInterval(() => {
      setCubeRotation((prev) => ({ ...prev, y: (prev.y + 0.7) % 360 }));
    }, 25);
    return () => clearInterval(interval);
  }, [autoRotate, activeStyle]);

  // Snap Cube to Face
  const snapCubeTo = (face) => {
    setAutoRotate(false);
    if (face === 'front') setCubeRotation({ x: 0, y: 0 });
    if (face === 'right') setCubeRotation({ x: 0, y: -90 });
    if (face === 'back') setCubeRotation({ x: 0, y: -180 });
    if (face === 'left') setCubeRotation({ x: 0, y: 90 });
  };

  // ==========================================================
  // STYLE 2: 3D DEPTH TUNNEL STATE
  // ==========================================================
  const [tunnelOffset, setTunnelOffset] = useState(0);
  const tunnelStageRef = useRef(null);
  const [tunnelMouse, setTunnelMouse] = useState({ x: 0, y: 0 });

  const handleTunnelMouseMove = (e) => {
    if (!tunnelStageRef.current) return;
    const rect = tunnelStageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setTunnelMouse({ x, y });
  };

  // ==========================================================
  // STYLE 3: LIQUID CHROME & FOIL CARD STATE
  // ==========================================================
  const chromeCardRef = useRef(null);
  const [chromeGlare, setChromeGlare] = useState({ x: 50, y: 50, rx: 0, ry: 0, deg: 135 });

  const handleChromeMouseMove = (e) => {
    if (!chromeCardRef.current) return;
    const rect = chromeCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -14;
    const ry = ((x - cx) / cx) * 14;
    const deg = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 180;
    setChromeGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      rx,
      ry,
      deg,
    });
  };

  // ==========================================================
  // STYLE 4: DUAL MONOLITH SPLIT STATE
  // ==========================================================
  const monolithStageRef = useRef(null);
  const [monolithTilt, setMonolithTilt] = useState({ rx: 0, ry: 0 });

  const handleMonolithMouseMove = (e) => {
    if (!monolithStageRef.current) return;
    const rect = monolithStageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setMonolithTilt({ rx: y, ry: x });
  };

  return (
    <div 
      className="threed-showcase-page"
      onMouseMove={(e) => {
        if (activeStyle === 'cube') handleCubeMouseMove(e);
      }}
      onMouseUp={() => {
        if (activeStyle === 'cube') handleCubeMouseUp();
      }}
    >
      {/* ==========================================================
          HEADER & INTERACTIVE STYLE SWITCHER
          ========================================================== */}
      <header className="showcase-header">
        <div className="header-nav-row">
          <Link to="/" className="back-store-btn">← Back to Store</Link>
          <Link to="/intro-demos" className="intro-demo-link">✨ Intro Animations</Link>
          <span className="mono-badge">3D CREATIVE STUDIO</span>
        </div>

        <h1 className="showcase-headline">Next-Gen 3D UI Styles for DRAKEWEARS</h1>
        <p className="showcase-sub">
          Aapke brand ke liye <strong>5 Mukhtalif 3D Interactive Design Styles</strong> tayyar kiye hain. 
          Neeche diye gaye styles par click karein, 3D elements ko mouse se ghuma kar aur drag karke dekhein!
        </p>

        {/* 3D Styles Tabs Navigation */}
        <div className="style-tabs-container">
          <button 
            className={`style-tab-chip ${activeStyle === 'cube' ? 'active' : ''}`}
            onClick={() => setActiveStyle('cube')}
          >
            <FiBox /> 1. 360° Interactive 3D Orbit Cube
          </button>

          <button 
            className={`style-tab-chip ${activeStyle === 'tunnel' ? 'active' : ''}`}
            onClick={() => setActiveStyle('tunnel')}
          >
            <FiCompass /> 2. 3D Spatial Depth Runway
          </button>

          <button 
            className={`style-tab-chip ${activeStyle === 'chrome' ? 'active' : ''}`}
            onClick={() => setActiveStyle('chrome')}
          >
            <FiLayers /> 3. Liquid Chrome & Holographic Foil
          </button>

          <button 
            className={`style-tab-chip ${activeStyle === 'monolith' ? 'active' : ''}`}
            onClick={() => setActiveStyle('monolith')}
          >
            <FiMaximize2 /> 4. Dual Monolith Split Perspective
          </button>
        </div>
      </header>

      {/* ==========================================================
          DYNAMIC 3D WORKSPACE CANVAS
          ========================================================== */}
      <div className="showcase-canvas-wrapper">

        {/* --------------------------------------------------------
            STYLE 1: 360° INTERACTIVE 3D ORBIT CUBE
            -------------------------------------------------------- */}
        {activeStyle === 'cube' && (
          <div className="style-canvas-box cube-canvas">
            <div className="canvas-meta-bar">
              <div>
                <span className="meta-tag">STYLE 01 // VIRTUAL ATELIER</span>
                <h3>360° Interactive 3D Orbit Cube</h3>
                <p>Mouse se cube ko pakar kar kisi bhi taraf ghumayein (360° Free Orbit). Kisi bhi face par click kar ke foran inspect karein.</p>
              </div>

              <div className="cube-controls-row">
                <button 
                  className={`cube-btn ${autoRotate ? 'btn-active' : ''}`}
                  onClick={() => setAutoRotate(!autoRotate)}
                >
                  <FiRotateCw /> {autoRotate ? 'Auto-Orbit: ON' : 'Auto-Orbit: OFF'}
                </button>
                <button className="cube-btn" onClick={() => snapCubeTo('front')}>Front</button>
                <button className="cube-btn" onClick={() => snapCubeTo('right')}>Right</button>
                <button className="cube-btn" onClick={() => snapCubeTo('back')}>Back</button>
                <button className="cube-btn" onClick={() => snapCubeTo('left')}>Left</button>
              </div>
            </div>

            <div 
              className="cube-viewport-stage"
              onMouseDown={handleCubeMouseDown}
            >
              {/* Floor ambient shadow */}
              <div className="cube-floor-shadow"></div>

              {/* The 3D Rotating Cube */}
              <div 
                className="orbit-cube-3d"
                style={{
                  transform: `rotateX(${cubeRotation.x}deg) rotateY(${cubeRotation.y}deg)`,
                }}
              >
                {/* Face 1: Front (Hoodie) */}
                <div className="cube-face face-front">
                  <div className="cube-face-inner">
                    <span className="face-kicker">01 // SS26 DROP</span>
                    <img src="/carousel-1.jpg" alt="Drake Hoodie" className="cube-face-img" />
                    <div className="cube-face-info">
                      <h4>OVERSIZED HEAVY HOODIE</h4>
                      <p>450 GSM French Terry</p>
                      <span className="face-price">Rs. 4,499</span>
                    </div>
                  </div>
                </div>

                {/* Face 2: Right (Baggy Pants) */}
                <div className="cube-face face-right">
                  <div className="cube-face-inner">
                    <span className="face-kicker">02 // BOTTOMS</span>
                    <img src="/home-category-baggy.jfif" alt="Baggy Cargos" className="cube-face-img" />
                    <div className="cube-face-info">
                      <h4>BAGGY CARGO PANTS</h4>
                      <p>14 oz Raw Wash Denim</p>
                      <span className="face-price">Rs. 3,899</span>
                    </div>
                  </div>
                </div>

                {/* Face 3: Back (Drop Shoulder Tee) */}
                <div className="cube-face face-back">
                  <div className="cube-face-inner">
                    <span className="face-kicker">03 // ESSENTIALS</span>
                    <img src="/home-page-category.jpg" alt="Drop Shoulder Tee" className="cube-face-img" />
                    <div className="cube-face-info">
                      <h4>DROP-SHOULDER BOX TEE</h4>
                      <p>280 GSM Bio-Washed Cotton</p>
                      <span className="face-price">Rs. 2,499</span>
                    </div>
                  </div>
                </div>

                {/* Face 4: Left (Limited Drop) */}
                <div className="cube-face face-left">
                  <div className="cube-face-inner">
                    <span className="face-kicker">04 // VAULT DROP</span>
                    <img src="/carousel-1.jpg" alt="Vault Drop" className="cube-face-img" />
                    <div className="cube-face-info">
                      <h4>ATELIER ZIP HOODIE</h4>
                      <p>Limited 50 Pieces Worldwide</p>
                      <span className="face-price">Rs. 5,299</span>
                    </div>
                  </div>
                </div>

                {/* Face 5: Top (Brand Crown) */}
                <div className="cube-face face-top">
                  <div className="cube-top-content">
                    <span>EST. 2024</span>
                    <h3>DRAKEWEARS</h3>
                    <small>PAKISTAN'S LUXURY STREETWEAR</small>
                  </div>
                </div>

                {/* Face 6: Bottom */}
                <div className="cube-face face-bottom">
                  <div className="cube-bottom-content">
                    <span>450 GSM</span>
                  </div>
                </div>
              </div>

              <div className="cube-drag-hint">
                <FiMove /> Click and drag anywhere to rotate 360°
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------
            STYLE 2: 3D SPATIAL DEPTH RUNWAY TUNNEL
            -------------------------------------------------------- */}
        {activeStyle === 'tunnel' && (
          <div className="style-canvas-box tunnel-canvas">
            <div className="canvas-meta-bar">
              <div>
                <span className="meta-tag">STYLE 02 // SPATIAL DEPTH</span>
                <h3>3D Infinite Runway Tunnel</h3>
                <p>Cards deep Z-axis space mein lay ki gayi hain. Mouse ghuma kar 3D camera angle change karein ya slider se Z-depth flythrough karein.</p>
              </div>

              <div className="tunnel-controls-box">
                <span className="tunnel-label">Z-Depth Flight:</span>
                <input 
                  type="range" 
                  min="-300" 
                  max="300" 
                  value={tunnelOffset}
                  onChange={(e) => setTunnelOffset(Number(e.target.value))}
                  className="tunnel-slider"
                />
              </div>
            </div>

            <div 
              ref={tunnelStageRef}
              className="tunnel-viewport-stage"
              onMouseMove={handleTunnelMouseMove}
            >
              <div 
                className="tunnel-3d-world"
                style={{
                  transform: `rotateX(${tunnelMouse.y}deg) rotateY(${tunnelMouse.x}deg)`,
                }}
              >
                {/* 5 Cards positioned in progressive 3D depth */}
                {[
                  { z: -400, title: 'VAULT EDITION PUFFER', sub: 'WINTER DROP', img: '/carousel-1.jpg', price: 'Rs. 7,499' },
                  { z: -200, title: 'RAW ACID WASH TEE', sub: '280 GSM', img: '/home-page-category.jpg', price: 'Rs. 2,499' },
                  { z: 0, title: 'SIGNATURE BAGGY BOTTOM', sub: '14 OZ RAW FINISH', img: '/home-category-baggy.jfif', price: 'Rs. 3,899' },
                  { z: 200, title: '450 GSM HEAVY HOODIE', sub: 'FRENCH TERRY', img: '/carousel-1.jpg', price: 'Rs. 4,499' },
                  { z: 400, title: 'ATELIER CARGO TROUSER', sub: 'RELAXED SILHOUETTE', img: '/home-category-baggy.jfif', price: 'Rs. 4,199' },
                ].map((item, idx) => {
                  const currentZ = item.z + tunnelOffset;
                  const isVisible = currentZ > -600 && currentZ < 550;
                  if (!isVisible) return null;

                  return (
                    <div
                      key={idx}
                      className="tunnel-3d-card"
                      style={{
                        transform: `translateZ(${currentZ}px) translateX(${((idx - 2) * 90)}px)`,
                        opacity: Math.max(0.2, 1 - Math.abs(currentZ) / 550),
                        filter: `blur(${Math.max(0, (Math.abs(currentZ) - 150) / 100)}px)`,
                      }}
                    >
                      <img src={item.img} alt={item.title} className="tunnel-card-img" />
                      <div className="tunnel-card-overlay">
                        <span className="tunnel-card-tag">{item.sub}</span>
                        <h4>{item.title}</h4>
                        <strong>{item.price}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------
            STYLE 3: LIQUID CHROME & HOLOGRAPHIC FOIL
            -------------------------------------------------------- */}
        {activeStyle === 'chrome' && (
          <div className="style-canvas-box chrome-canvas">
            <div className="canvas-meta-bar">
              <div>
                <span className="meta-tag">STYLE 03 // CYBER LUXURY</span>
                <h3>Liquid Chrome & Holographic Foil Specular</h3>
                <p>Card par cursor move karein — real-time metallic chrome reflection angle change karta hai aur liquid silver glow create karta hai.</p>
              </div>
            </div>

            <div className="chrome-viewport-stage">
              <div 
                ref={chromeCardRef}
                className="chrome-card-3d"
                onMouseMove={handleChromeMouseMove}
                style={{
                  transform: `perspective(1000px) rotateX(${chromeGlare.rx}deg) rotateY(${chromeGlare.ry}deg)`,
                }}
              >
                {/* Dynamic Metallic Foil Reflection */}
                <div 
                  className="chrome-foil-layer"
                  style={{
                    background: `linear-gradient(${chromeGlare.deg}deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 45%, rgba(200,200,220,0.8) 50%, rgba(255,255,255,0.4) 55%, transparent 100%)`,
                  }}
                />

                <div className="chrome-card-inner">
                  <div className="chrome-card-top">
                    <span className="chrome-edition-badge">TITANIUM SPEC // 01</span>
                    <span className="chrome-serial">SERIAL #DK-2026</span>
                  </div>

                  <div className="chrome-product-stage">
                    <img src="/carousel-1.jpg" alt="Drake Chrome Hoodie" className="chrome-product-img" />
                    <div className="chrome-embossed-watermark">DRAKEWEARS</div>
                  </div>

                  <div className="chrome-card-info">
                    <span className="chrome-kicker">450 GSM HEAVYWEIGHT KNIT</span>
                    <h2 className="chrome-title">Liquid Silver Raw Hoodie</h2>
                    <div className="chrome-footer-row">
                      <span className="chrome-price">Rs. 4,999</span>
                      <button className="chrome-buy-btn">ACQUIRE DROP →</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------
            STYLE 4: DUAL MONOLITH SPLIT PERSPECTIVE
            -------------------------------------------------------- */}
        {activeStyle === 'monolith' && (
          <div className="style-canvas-box monolith-canvas">
            <div className="canvas-meta-bar">
              <div>
                <span className="meta-tag">STYLE 04 // HIGH EDITORIAL</span>
                <h3>Dual Monolith Split-Screen Perspective</h3>
                <p>Do vertical 3D towers ek sath counterbalance hokar rotate hoti hain — Left side par full lookbook silhouette aur Right side par 450 GSM fabric macro texture.</p>
              </div>
            </div>

            <div 
              ref={monolithStageRef}
              className="monolith-viewport-stage"
              onMouseMove={handleMonolithMouseMove}
            >
              <div className="monolith-grid-stage">
                {/* Tower 1: Full Silhouette (Tilts Left) */}
                <div 
                  className="monolith-tower tower-left"
                  style={{
                    transform: `perspective(1200px) rotateX(${monolithTilt.rx}deg) rotateY(${monolithTilt.ry - 8}deg) translateZ(20px)`,
                  }}
                >
                  <img src="/home-category-baggy.jfif" alt="Full Lookbook" className="tower-img" />
                  <div className="tower-overlay">
                    <span className="tower-spec-tag">ANGLE 01 // VOLUMETRIC SILHOUETTE</span>
                    <h3>Baggy Cut Raw Cargos</h3>
                    <p>Wide leg profile engineered to stack effortlessly over luxury sneakers.</p>
                  </div>
                </div>

                {/* Center Floating Crosshair Specs */}
                <div className="monolith-center-axis">
                  <div className="axis-line"></div>
                  <div className="axis-badge">
                    <span>450 GSM</span>
                    <small>PRECISION CALIBRATED</small>
                  </div>
                  <div className="axis-line"></div>
                </div>

                {/* Tower 2: Fabric Macro Texture (Tilts Right) */}
                <div 
                  className="monolith-tower tower-right"
                  style={{
                    transform: `perspective(1200px) rotateX(${monolithTilt.rx}deg) rotateY(${monolithTilt.ry + 8}deg) translateZ(20px)`,
                  }}
                >
                  <img src="/home-page-category.jpg" alt="Macro Texture" className="tower-img" />
                  <div className="tower-overlay">
                    <span className="tower-spec-tag">ANGLE 02 // TEXTURE CLOSE-UP</span>
                    <h3>High-Density French Terry</h3>
                    <p>Loopback knit construction designed to never pill or warp under heat.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================================
          BOTTOM COMPARISON & ACTION BAR
          ========================================================== */}
      <footer className="showcase-studio-footer">
        <div className="footer-content-wrap">
          <div className="footer-left-info">
            <h3>In 4 naye styles mein se aapko konsa vibe sabse tagra laga?</h3>
            <p>
              Aap batayein ke landing page ke Hero section par <strong>360° Orbit Cube</strong> chahiye, 
              <strong>Runway Depth Tunnel</strong> chahiye, ya <strong>Dual Monolith Split</strong> chahiye? 
              Hum foran usay live site par configure kar dain gay!
            </p>
          </div>

          <div className="footer-action-links">
            <Link to="/" className="btn-main-preview">Check Current Home (Deck Carousel)</Link>
            <Link to="/shop" className="btn-shop-preview">Check Shop 3D Tilt Cards</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
