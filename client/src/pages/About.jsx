import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  // Simple scroll animation observer
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
    <div className="page-wrapper">
      <main className="main-content">
        
        {/* 1. Hero Section */}
        <section className="about-hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content animate-on-scroll">
            <h1 className="text-script" style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', color: 'white', marginBottom: '24px', lineHeight: 1 }}>
              drakewears
            </h1>
            <h1 className="h1">Redefining Pakistan’s Street & Athletic Fit.</h1>
            <p className="text-body hero-subtext">
              Heavyweight baggy cuts & high-performance compression gear.
            </p>
          </div>
        </section>

        {/* 2. Craftsmanship Section */}
        <section className="craftsmanship-section">
          <div className="container craftsmanship-grid">
            <div className="craft-image-container animate-on-scroll">
              {/* Demo Image */}
              <img 
                src="https://images.unsplash.com/photo-1550614000-4b95d4ed79ea?q=80&w=1974&auto=format&fit=crop" 
                alt="Craftsmanship" 
                className="craft-image"
              />
            </div>
            <div className="craft-text-container animate-on-scroll">
              <h2 className="h2">Precision Fits,<br/>Zero Shortcuts</h2>
              <p className="text-body" style={{ marginTop: '24px' }}>
                Engineered for daily wear and heavy training. We design our drop-shoulder oversized silhouettes and locked-in compression wear using custom high-GSM fabrics that hold their shape and never lose their vibrancy.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Philosophy Grid */}
        <section className="philosophy-section">
          <div className="container about-grid">
            <div className="about-text animate-on-scroll">
              <h3 className="h3">The Dual Identity</h3>
              <p className="text-body" style={{ marginTop: '16px' }}>
                Effortless volume for the streets, second-skin discipline for the grind.
              </p>
            </div>
            <div className="about-text animate-on-scroll">
              <h3 className="h3">Built to Last</h3>
              <p className="text-body" style={{ marginTop: '16px' }}>
                Pre-shrunk, fade-resistant fabrics crafted to survive repeated washes without losing structure.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Founder's Note */}
        <section className="founder-section animate-on-scroll">
          <div className="container text-center">
            <blockquote className="founder-quote">
              "Designed with volume.<br/>Crafted with intent."
            </blockquote>
            <p className="text-script founder-signature">drakewears</p>
          </div>
        </section>

        {/* 5. Fabric Care & Disclaimer */}
        <section className="care-section animate-on-scroll">
          <div className="container care-container">
            <h3 className="h3">Texture & Care Note</h3>
            <p className="text-body" style={{ marginTop: '16px' }}>
              Our heavyweight knits and specialty compression fabrics offer a rich, textured feel. To keep their fit and texture intact, always use a <strong>cold machine wash / gentle cycle</strong>. Avoid using high heat. Do not iron on the front/outside; instead, iron carefully on the inside (inside-out).
            </p>
          </div>
        </section>

        {/* 6. Call to Action (CTA) */}
        <section className="cta-section animate-on-scroll">
          <div className="container text-center">
            <h2 className="h2" style={{ marginBottom: '32px' }}>Upgrade Your Rotation.</h2>
            <Link to="/products" className="btn btn-primary btn-large">
              Shop The Drop
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
};

export default About;
