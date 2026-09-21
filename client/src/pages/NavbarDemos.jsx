import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiShoppingBag, 
  FiHeart, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiArrowRight, 
  FiCheck,
  FiCompass,
  FiSliders
} from 'react-icons/fi';
import './NavbarDemos.css';

const NAV_STYLES = [
  {
    id: 1,
    title: 'Floating Glass Island (Capsule Dock)',
    tag: 'MODERN LUXURY AESTHETIC',
    desc: 'Screen ke top se thora neechay floating glass capsule dock. Frosted glass blur aur rounded sleek shape ke sath modern e-commerce sites ka sabse trending design.',
  },
  {
    id: 2,
    title: 'High-Fashion Center Logo & Split Links',
    tag: 'PARISIAN / BALENCIAGA STYLE',
    desc: 'Signature drakewears script logo theek screen ke CENTER mein hota hai. Left side par collection links aur right side par icons. Pure high-end atelier fashion feel.',
  },
  {
    id: 3,
    title: 'Minimalist Architectural Line with Sliding Indicator',
    tag: 'JAPANESE STREETWEAR STYLE',
    desc: 'Full-width ultra-clean borderless bar. Har link ke neechay fluid indicator line smooth spring animation ke sath slide karti hai.',
  },
  {
    id: 4,
    title: 'Editorial Lookbook Drawer Trigger',
    tag: 'OFF-WHITE / KITH RUNWAY',
    desc: 'Header bilkul clean aur minimal rehta hai. "MENU" button par tap karne se full-screen luxury high-fashion lookbook drawer open hota hai.',
  },
];

export default function NavbarDemos() {
  const [activeNav, setActiveNav] = useState(1);
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' or 'light'
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);

  return (
    <div className={`nav-demos-page theme-${themeMode}`}>
      {/* Header & Controls */}
      <header className="nav-demos-header">
        <div className="header-breadcrumbs">
          <Link to="/" className="btn-back-nav">← Back to Store</Link>
          <Link to="/intro-demos" className="btn-intro-nav">✨ Intro Animation Demos</Link>
          <span className="badge-studio">NAVBAR DESIGN STUDIO</span>
        </div>

        <h1 className="nav-demos-title">Select Your Brand Navbar Style</h1>
        <p className="nav-demos-sub">
          Aapke brand <strong>DRAKEWEARS</strong> ke liye **4 Mukhtalif Navbar Designs** tayyar kiye hain. 
          Neeche diye gaye styles par click karein aur live preview check karein!
        </p>

        {/* Style Selector Tabs */}
        <div className="nav-styles-tabs">
          {NAV_STYLES.map((style) => (
            <button
              key={style.id}
              className={`nav-tab-btn ${activeNav === style.id ? 'active' : ''}`}
              onClick={() => setActiveNav(style.id)}
            >
              <span className="tab-num">0{style.id}</span>
              <span className="tab-title">{style.title.split('(')[0]}</span>
            </button>
          ))}
        </div>

        {/* Theme Switcher Toggle */}
        <div className="theme-toggle-bar">
          <span className="toggle-label">Preview Background Color Theme:</span>
          <button 
            className={`theme-chip ${themeMode === 'dark' ? 'active' : ''}`}
            onClick={() => setThemeMode('dark')}
          >
            Dark Mode (Charcoal Void)
          </button>
          <button 
            className={`theme-chip ${themeMode === 'light' ? 'active' : ''}`}
            onClick={() => setThemeMode('light')}
          >
            Original Light Mode (Clean Off-White)
          </button>
        </div>
      </header>

      {/* ==========================================================
          LIVE NAVBAR DEMO PREVIEW STAGE
          ========================================================== */}
      <div className="nav-preview-stage-wrapper">
        <div className="preview-meta-info">
          <span className="style-kicker">{NAV_STYLES[activeNav - 1].tag}</span>
          <h2>{NAV_STYLES[activeNav - 1].title}</h2>
          <p>{NAV_STYLES[activeNav - 1].desc}</p>
        </div>

        {/* STAGE CONTAINER WITH MOCK HOMEPAGE */}
        <div className={`nav-live-mock-stage mock-${themeMode}`}>

          {/* --------------------------------------------------------
              NAVBAR STYLE 01: FLOATING GLASS ISLAND (CAPSULE DOCK)
              -------------------------------------------------------- */}
          {activeNav === 1 && (
            <div className="nav-style-1-wrapper">
              <nav className="nav-island-capsule">
                <div className="island-left">
                  <Link to="/" className="island-logo">
                    <img 
                      src={themeMode === 'dark' ? '/drakewears-logo-white.png' : '/drakewears-logo.png'} 
                      alt="drakewears" 
                      className="island-logo-img"
                    />
                  </Link>
                </div>

                <div className="island-center">
                  <Link to="/shop" className="island-link active">Shop All</Link>
                  <Link to="/shop?category=baggy-trousers" className="island-link">Bottoms</Link>
                  <Link to="/shop?category=drop-shoulder-tees" className="island-link">Tees</Link>
                  <Link to="/about" className="island-link">Atelier</Link>
                </div>

                <div className="island-right">
                  <button className="island-icon-btn" aria-label="Search">
                    <FiSearch size={17} />
                  </button>
                  <button className="island-icon-btn" aria-label="Wishlist">
                    <FiHeart size={17} />
                  </button>
                  <button className="island-icon-btn island-cart-btn" aria-label="Cart">
                    <FiShoppingBag size={17} />
                    <span className="cart-badge-pill">2</span>
                  </button>
                </div>
              </nav>
            </div>
          )}

          {/* --------------------------------------------------------
              NAVBAR STYLE 02: HIGH-FASHION CENTER SCRIPT LOGO
              -------------------------------------------------------- */}
          {activeNav === 2 && (
            <div className="nav-style-2-wrapper">
              <div className="style-2-announcement">
                <span>⚡ FREE SHIPPING OVER RS. 5000 | USE CODE: <strong>DRAKEFREESHIP</strong> ⚡</span>
              </div>
              <nav className="nav-style-2-bar">
                <div className="style-2-left">
                  <Link to="/shop" className="style-2-link">Shop</Link>
                  <Link to="/shop?category=baggy-trousers" className="style-2-link">Bottoms</Link>
                  <Link to="/about" className="style-2-link">About</Link>
                </div>

                <div className="style-2-center">
                  <Link to="/" className="style-2-center-logo">
                    <img 
                      src={themeMode === 'dark' ? '/drakewears-logo-white.png' : '/drakewears-logo.png'} 
                      alt="drakewears" 
                      className="center-big-logo" 
                    />
                  </Link>
                </div>

                <div className="style-2-right">
                  <button className="style-2-icon" title="Search"><FiSearch size={18} /></button>
                  <button className="style-2-icon" title="Profile"><FiUser size={18} /></button>
                  <button className="style-2-icon style-2-cart" title="Cart">
                    <FiShoppingBag size={18} />
                    <span className="cart-dot"></span>
                  </button>
                </div>
              </nav>
            </div>
          )}

          {/* --------------------------------------------------------
              NAVBAR STYLE 03: MINIMALIST ARCHITECTURAL LINE
              -------------------------------------------------------- */}
          {activeNav === 3 && (
            <div className="nav-style-3-wrapper">
              <nav className="nav-style-3-bar">
                <div className="style-3-left">
                  <Link to="/" className="style-3-brand-text">
                    DRAKEWEARS
                    <small>ARCHIVE ©2026</small>
                  </Link>
                </div>

                <div className="style-3-center">
                  <Link to="/shop" className="style-3-tab active">
                    CATALOG
                    <span className="tab-indicator-line"></span>
                  </Link>
                  <Link to="/shop?category=baggy-trousers" className="style-3-tab">
                    CARGOS
                  </Link>
                  <Link to="/shop?category=drop-shoulder-tees" className="style-3-tab">
                    OVERSIZED
                  </Link>
                  <Link to="/about" className="style-3-tab">
                    PHILOSOPHY
                  </Link>
                </div>

                <div className="style-3-right">
                  <span className="style-3-currency">PKR (RS)</span>
                  <button className="style-3-btn"><FiSearch size={16} /></button>
                  <button className="style-3-btn"><FiShoppingBag size={16} /> [02]</button>
                </div>
              </nav>
            </div>
          )}

          {/* --------------------------------------------------------
              NAVBAR STYLE 04: EDITORIAL LOOKBOOK DRAWER TRIGGER
              -------------------------------------------------------- */}
          {activeNav === 4 && (
            <div className="nav-style-4-wrapper">
              <nav className="nav-style-4-bar">
                <div className="style-4-left">
                  <img 
                    src={themeMode === 'dark' ? '/drakewears-logo-white.png' : '/drakewears-logo.png'} 
                    alt="drakewears" 
                    className="style-4-logo"
                  />
                </div>

                <div className="style-4-ticker">
                  <span>SS26 ATELIER DROP • 450 GSM HEAVY FLEECE AVAILABLE NOW</span>
                </div>

                <div className="style-4-right">
                  <button className="style-4-icon-btn"><FiShoppingBag size={18} /> (2)</button>
                  <button 
                    className="style-4-menu-trigger"
                    onClick={() => setMenuDrawerOpen(!menuDrawerOpen)}
                  >
                    {menuDrawerOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                    <span>{menuDrawerOpen ? 'CLOSE' : 'MENU'}</span>
                  </button>
                </div>
              </nav>

              {/* Fullscreen Lookbook Drawer Preview */}
              {menuDrawerOpen && (
                <div className="style-4-drawer-overlay">
                  <div className="drawer-inner-grid">
                    <div className="drawer-nav-list">
                      <Link to="/shop" className="drawer-huge-link">01. ALL COLLECTIONS →</Link>
                      <Link to="/shop?category=baggy-trousers" className="drawer-huge-link">02. BAGGY CARGOS →</Link>
                      <Link to="/shop?category=drop-shoulder-tees" className="drawer-huge-link">03. 280 GSM BOX TEES →</Link>
                      <Link to="/about" className="drawer-huge-link">04. CRAFTSMANSHIP →</Link>
                    </div>
                    <div className="drawer-preview-card">
                      <img src="/home-page-category.jpg" alt="Lookbook" className="drawer-preview-img" />
                      <div className="drawer-preview-caption">SS26 EDITORIAL LOOKBOOK // LAHORE</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mock Homepage Hero Content underneath Navbar */}
          <div className="mock-home-underneath">
            <div className="mock-hero-caption">
              <span className="mock-drop-tag">SS26 // VOLUMETRIC</span>
              <h1>COLLECTIONS 2026©</h1>
              <p>Oversized streetwear silhouettes engineered with high-density 450 GSM fabrics.</p>
              <div className="mock-btn-row">
                <span className="mock-primary-btn">EXPLORE SHOP →</span>
                <span className="mock-ghost-btn">VIEW ATELIER</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="nav-demos-footer">
        <h3>Aapko inme se konsa Navbar Style sabse pasand aaya?</h3>
        <p>
          - **Option 01: Floating Glass Island** (Modern high-tech capsule)<br/>
          - **Option 02: High-Fashion Center Logo** (Classic Parisian luxury brand layout)<br/>
          - **Option 03: Minimalist Architecture Line** (Clean typography & sliding indicator)<br/>
          - **Option 04: Editorial Lookbook Drawer** (Runway streetwear with full-screen menu)
        </p>
        <div className="footer-links-row">
          <Link to="/" className="footer-btn-primary">Go to Current Store</Link>
          <Link to="/intro-demos" className="footer-btn-sec">Review Opening Animations</Link>
          <Link to="/3d-demos" className="footer-btn-sec">Review 3D Studio</Link>
        </div>
      </footer>
    </div>
  );
}
