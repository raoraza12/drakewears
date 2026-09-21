import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiShield, FiPackage, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import './About.css';

const About = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-wrapper about-3d-page">
      <main className="main-content">
        
        {/* 1. Minimal Clean Hero */}
        <section className="about-hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content animate-on-scroll">
            <span className="about-kicker-badge">MADE IN PAKISTAN // STREETWEAR</span>
            <h1 className="text-script" style={{ fontSize: 'clamp(3.5rem, 8vw, 6.5rem)', color: '#ffffff', marginBottom: '12px', lineHeight: 1 }}>
              drakewears
            </h1>
            <h2 className="h1" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', maxWidth: '750px', margin: '0 auto 16px' }}>
              Heavyweight 450 GSM Streetwear. Built to Last.
            </h2>
            <p className="text-body hero-subtext" style={{ maxWidth: '620px', margin: '0 auto', color: '#d4d4d8' }}>
              Engineered with high-density cotton fleece, architectural baggy silhouettes, and zero shortcuts.
            </p>
          </div>
        </section>

        {/* 2. Four Core Trust Pillars (Nationwide Delivery, 450 GSM, Baggy Cut, Exchange) */}
        <section className="about-pillars-section">
          <div className="container">
            <div className="section-title-wrap text-center">
              <span className="section-kicker">THE STANDARD</span>
              <h2 className="section-main-title">Why DrakeWears</h2>
            </div>

            <div className="about-pillars-grid">
              <div className="about-pillar-3d-card animate-on-scroll">
                <div className="pillar-header">
                  <span className="pillar-num">01</span>
                  <div className="pillar-icon"><FiPackage size={22} /></div>
                </div>
                <span className="pillar-sub">NATIONWIDE SHIPPING</span>
                <h3 className="pillar-title">All Over Pakistan Deliveries</h3>
                <p className="pillar-desc">Cash on Delivery (COD) available in all cities across Pakistan. Fast dispatch with real-time tracking.</p>
                <div className="pillar-bottom-bar"></div>
              </div>

              <div className="about-pillar-3d-card animate-on-scroll">
                <div className="pillar-header">
                  <span className="pillar-num">02</span>
                  <div className="pillar-icon"><FiLayers size={22} /></div>
                </div>
                <span className="pillar-sub">FABRIC DENSITY</span>
                <h3 className="pillar-title">450 GSM Heavy French Terry</h3>
                <p className="pillar-desc">We reject thin, flimsy blanks. High-density structured cotton that retains its silhouette wash after wash.</p>
                <div className="pillar-bottom-bar"></div>
              </div>

              <div className="about-pillar-3d-card animate-on-scroll">
                <div className="pillar-header">
                  <span className="pillar-num">03</span>
                  <div className="pillar-icon"><FiShield size={22} /></div>
                </div>
                <span className="pillar-sub">STREETWEAR SILHOUETTE</span>
                <h3 className="pillar-title">Signature Baggy & Boxy Fits</h3>
                <p className="pillar-desc">Calibrated drop-shoulder tees and wide-leg trousers engineered specifically for modern street culture.</p>
                <div className="pillar-bottom-bar"></div>
              </div>

              <div className="about-pillar-3d-card animate-on-scroll">
                <div className="pillar-header">
                  <span className="pillar-num">04</span>
                  <div className="pillar-icon"><FiRefreshCw size={22} /></div>
                </div>
                <span className="pillar-sub">100% SATISFACTION</span>
                <h3 className="pillar-title">7-Day Hassle-Free Exchange</h3>
                <p className="pillar-desc">Size ya fit sahi nahi aya? 7 din me direct exchange. Real human support on WhatsApp.</p>
                <div className="pillar-bottom-bar"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Visual Showcase (Baggy Trouser Image + Craftsmanship) */}
        <section className="craftsmanship-section">
          <div className="container craftsmanship-grid">
            <div className="craft-image-container animate-on-scroll">
              <img 
                src="/home-category-baggy.jfif" 
                onError={(e) => { e.currentTarget.src = '/home-page-category.jpg'; }}
                alt="DrakeWears Baggy Trouser" 
                className="craft-image" 
              />
              <div className="craft-floating-badge">
                <span>14 OZ RAW FINISH // SIGNATURE FIT</span>
              </div>
            </div>
            <div className="craft-text-container animate-on-scroll">
              <span className="section-kicker">MANUFACTURING DISCIPLINE</span>
              <h2 className="h2" style={{ marginTop: '8px', fontSize: '2.2rem', fontWeight: 900 }}>Crafted for Pakistan's Streets</h2>
              <p className="text-body" style={{ marginTop: '16px', lineHeight: 1.6, color: '#a1a1aa' }}>
                We started DrakeWears to solve one clear frustration: standard Pakistani market me authentic baggy trousers aur heavy cotton nahi milte thay. Every piece is cut from high-GSM combed cotton with reinforced industrial seams.
              </p>
              <div className="craft-specs-mini-row" style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.3rem', color: '#fff' }}>450+</strong>
                  <span style={{ fontSize: '0.72rem', color: '#71717a', letterSpacing: '0.1em' }}>GSM FLEECE</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.3rem', color: '#fff' }}>COD</strong>
                  <span style={{ fontSize: '0.72rem', color: '#71717a', letterSpacing: '0.1em' }}>ALL PAKISTAN</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.3rem', color: '#fff' }}>7 DAYS</strong>
                  <span style={{ fontSize: '0.72rem', color: '#71717a', letterSpacing: '0.1em' }}>EASY EXCHANGE</span>
                </div>
              </div>

              <div style={{ marginTop: '28px' }}>
                <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 30px' }}>
                  <span>Explore Shop</span>
                  <FiArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Direct WhatsApp Support Prompt */}
        <section className="care-section animate-on-scroll">
          <div className="container care-container" style={{ textAlign: 'center', maxWidth: '650px' }}>
            <h3 className="h3">Need Sizing or Order Help?</h3>
            <p className="text-body" style={{ marginTop: '12px', lineHeight: 1.6 }}>
              Humari team real humans par mushtamil hai. Kisi bhi product, size guide ya order update ke liye aap directly WhatsApp par chat kar sakte hain.
            </p>
            <a 
              href="https://api.whatsapp.com/send?phone=923218254922&text=Hi%20DrakeWears,%20I%20have%20a%20question."
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-outline" 
              style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Chat on WhatsApp →</span>
            </a>
          </div>
        </section>

      </main>
    </div>
  );
};

export default About;

