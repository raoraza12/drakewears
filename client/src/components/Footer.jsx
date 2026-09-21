import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import './Footer.css';

const Footer = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thank you for subscribing to DRAKEWEARS drops! ⚡');
    setEmail('');
  };
  
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-container">
          <div className="footer-brand">
            <Link to="/" style={{ display: 'inline-block', textDecoration: 'none', padding: '4px 0', marginBottom: '8px' }}>
              <img src="/drakewears-logo-white.png?v=4" alt="drakewears" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
            </Link>
            <p className="text-body">Contemporary Fashion</p>
          </div>
          
          <div className="footer-links-group">
            <h3 className="footer-heading">Shop</h3>
            <Link to="/shop">All Products</Link>
            <Link to="/shop?category=baggy-trousers">Baggy Trousers</Link>
            <Link to="/shop?category=drop-shoulder-tees">Drop Shoulder Tees</Link>
          </div>
          
          <div className="footer-links-group">
            <h3 className="footer-heading">Information</h3>
            <Link to="/about">Our Story</Link>
            <Link to="/contact">Contact</Link>
          </div>
          
          <div className="footer-newsletter">
            <h3 className="footer-heading">Newsletter</h3>
            <p className="text-caption">Subscribe to receive updates, access to exclusive drops, and private deals.</p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p className="text-caption">© {new Date().getFullYear()} drakewears. All rights reserved.</p>
          <div className="footer-socials">
            <a 
              href="https://www.instagram.com/drakewears_official" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link" 
              title="Follow us on Instagram"
            >
              <FiInstagram size={18} />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link" 
              title="Facebook"
            >
              <FiFacebook size={18} />
            </a>
          </div>
          <div className="footer-legals">
            <Link to="/privacy" className="text-caption">Privacy Policy</Link>
            <Link to="/terms" className="text-caption">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
