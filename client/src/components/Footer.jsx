import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiInstagram, 
  FiFacebook, 
  FiMessageCircle, 
  FiPackage, 
  FiLayers, 
  FiRefreshCw, 
  FiShield, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiArrowRight,
  FiSend
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import './Footer.css';

const Footer = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const phone = settings?.contactPhone ? settings.contactPhone.replace(/[^0-9]/g, '') : '923218254922';
  const displayPhone = settings?.contactPhone || '0321-8254922';
  const contactEmail = settings?.contactEmail || 'info@drakewears.com';

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Welcome to the Inner Vault! ⚡ Enjoy priority access to new drops.');
    setEmail('');
  };
  
  return (
    <footer className="footer">
      {/* 1. Atelier Value-Pillars Strip */}
      <section className="footer-trust-strip" aria-label="Brand Guarantees">
        <div className="container footer-trust-grid">
          <div className="footer-trust-item">
            <div className="trust-icon-box"><FiPackage size={22} /></div>
            <div className="trust-text-box">
              <span className="trust-title">All Pakistan Delivery</span>
              <span className="trust-desc">Cash on Delivery (COD) Nationwide</span>
            </div>
          </div>

          <div className="footer-trust-item">
            <div className="trust-icon-box"><FiLayers size={22} /></div>
            <div className="trust-text-box">
              <span className="trust-title">Supreme Fabric Density</span>
              <span className="trust-desc">High-GSM combed cotton & zero shortcuts</span>
            </div>
          </div>

          <div className="footer-trust-item">
            <div className="trust-icon-box"><FiRefreshCw size={22} /></div>
            <div className="trust-text-box">
              <span className="trust-title">7-Day Easy Exchange</span>
              <span className="trust-desc">Guaranteed hassle-free size & fit exchange</span>
            </div>
          </div>

          <div className="footer-trust-item">
            <div className="trust-icon-box"><FiShield size={22} /></div>
            <div className="trust-text-box">
              <span className="trust-title">Direct Atelier Support</span>
              <span className="trust-desc">Instant VIP assistance on WhatsApp</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Luxury Footer Columns */}
      <div className="footer-main">
        <div className="container footer-container">
          
          {/* Brand & Manifesto Column */}
          <div className="footer-col footer-brand-col">
            <Link to="/" className="footer-logo-link" aria-label="DrakeWears Home">
              <img 
                src="/drakewears-logo-white.png" 
                alt="drakewears" 
                className="footer-logo-img" 
              />
            </Link>

            <p className="footer-brand-manifesto">
              Modern luxury streetwear atelier rooted in Pakistan. Engineered silhouettes, architectural baggy cuts, and bespoke heavyweight fabrics crafted without compromise.
            </p>

            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <FiMapPin size={15} className="contact-icon" />
                <span>Karachi, Pakistan (Nationwide Shipping)</span>
              </div>
              <a href={`mailto:${contactEmail}`} className="footer-contact-item">
                <FiMail size={15} className="contact-icon" />
                <span>{contactEmail}</span>
              </a>
              <a 
                href={`https://api.whatsapp.com/send?phone=${phone}&text=Hi%20drakewears,%20I%20have%20an%20inquiry.`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-contact-item"
              >
                <FiPhone size={15} className="contact-icon" />
                <span>{displayPhone} (WhatsApp VIP)</span>
              </a>
            </div>

            <div className="footer-live-status">
              <span className="footer-live-dot"></span>
              <span>ATELIER DISPATCHES ACTIVE MON — SAT</span>
            </div>
          </div>

          {/* Quick Collections */}
          <div className="footer-col">
            <h4 className="footer-heading">Collections</h4>
            <ul className="footer-links-list">
              <li><Link to="/shop">Shop All Drops</Link></li>
              <li><Link to="/shop?category=bottoms">Bottoms (Baggy Trousers)</Link></li>
              <li><Link to="/shop?category=tops">Tops (Drop Shoulder Tees)</Link></li>
              <li><Link to="/shop?category=hoodies">Hoodies & Fleece</Link></li>
              <li>
                <Link to="/vault" className="footer-vault-link">
                  <span>Drake Vault</span>
                  <span className="footer-badge-mini">1-OF-1</span>
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=new" style={{ color: '#d4af37', fontWeight: 600 }}>
                  ⚡ New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Care */}
          <div className="footer-col">
            <h4 className="footer-heading">Client Care</h4>
            <ul className="footer-links-list">
              <li><Link to="/track">Track Your Order</Link></li>
              <li><Link to="/about">Our Story & Atelier</Link></li>
              <li><Link to="/contact">Contact & VIP Support</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/profile">My Account</Link></li>
            </ul>
          </div>

          {/* Inner Vault Newsletter */}
          <div className="footer-col footer-newsletter-col">
            <h4 className="footer-heading">Inner Vault</h4>
            <p className="footer-newsletter-text">
              Subscribe for private access to limited 1-of-1 archive drops, secret collection launches, and VIP privileges.
            </p>

            <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
              <div className="newsletter-input-wrap">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="footer-newsletter-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="footer-newsletter-btn" aria-label="Subscribe to Inner Vault">
                  <FiArrowRight size={18} />
                </button>
              </div>
            </form>

            {subscribed && (
              <p className="newsletter-perk-hint" style={{ color: '#4ade80' }}>
                ✓ Subscribed! You will receive drop notifications first.
              </p>
            )}


            {/* Socials Row */}
            <div className="footer-socials-block">
              <span className="socials-label">Follow Atelier</span>
              <div className="footer-social-icons">
                <a 
                  href="https://www.instagram.com/drakewears_official" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-pill-link" 
                  title="Follow us on Instagram"
                  aria-label="Instagram"
                >
                  <FiInstagram size={17} />
                  <span>Instagram</span>
                </a>
                <a 
                  href={`https://api.whatsapp.com/send?phone=${phone}&text=Hi%20drakewears,%20I%20have%20an%20inquiry.`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-pill-link" 
                  title="Chat on WhatsApp"
                  aria-label="WhatsApp"
                >
                  <FiMessageCircle size={17} />
                  <span>WhatsApp</span>
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-pill-link" 
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <FiFacebook size={17} />
                  <span>Facebook</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3. Sub-Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <div className="footer-bottom-left">
            <p className="footer-copyright">
              © {new Date().getFullYear()} <strong>DRAKEWEARS</strong>. ALL RIGHTS RESERVED. CRAFTED IN PAKISTAN.
            </p>
          </div>

          <div className="footer-trust-badges">
            <span className="trust-badge-pill">CASH ON DELIVERY (COD)</span>
            <span className="trust-badge-pill">TCS / LEOPARDS EXPRESS</span>
            <span className="trust-badge-pill">100% SECURE CHECKOUT</span>
          </div>

          <div className="footer-region">
            <span className="region-pill">🇵🇰 Pakistan (PKR)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
