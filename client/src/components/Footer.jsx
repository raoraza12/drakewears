import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiArrowRight } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer maison-footer">
      <div className="container">
        <div className="maison-footer-top">
          <div className="maison-footer-brand">
            <span className="maison-footer-logo">MAISON VÊTU</span>
            <p className="maison-footer-desc">
              A study in silhouette and texture.<br/>Discover the Autumn/Winter 2024 Collection.
            </p>
            <div className="maison-footer-socials">
              <a href="#" className="social-link" title="Instagram"><FiInstagram size={16} /></a>
              <a href="#" className="social-link" title="Twitter"><FiTwitter size={16} /></a>
              <a href="#" className="social-link" title="Facebook"><FiFacebook size={16} /></a>
            </div>
          </div>

          <div className="maison-footer-col">
            <h4 className="maison-footer-col-title">COLLECTIONS</h4>
            <Link to="/shop?category=Women" className="maison-footer-link">Womenswear</Link>
            <Link to="/shop?category=Men" className="maison-footer-link">Menswear</Link>
            <Link to="/shop?category=Accessories" className="maison-footer-link">Accessories</Link>
            <Link to="/shop?newArrival=true" className="maison-footer-link">New Arrivals</Link>
          </div>

          <div className="maison-footer-col">
            <h4 className="maison-footer-col-title">ASSISTANCE</h4>
            <a href="#" className="maison-footer-link">Client Services</a>
            <a href="#" className="maison-footer-link">Shipping & Returns</a>
            <a href="#" className="maison-footer-link">Track Order</a>
            <a href="#" className="maison-footer-link">Boutique Finder</a>
          </div>

          <div className="maison-footer-col newsletter-col">
            <h4 className="maison-footer-col-title">THE MAISON CLUB</h4>
            <p className="maison-footer-link" style={{ marginBottom: '24px', maxWidth: '280px' }}>Sign up to receive the latest updates on new collections and exclusive events.</p>
            <div className="maison-newsletter">
              <form className="maison-newsletter-form" onSubmit={e => e.preventDefault()}>
                <input type="email" className="maison-newsletter-input" placeholder="EMAIL ADDRESS" />
                <button type="submit" className="maison-newsletter-btn" aria-label="Subscribe"><FiArrowRight size={18} strokeWidth={1} /></button>
              </form>
            </div>
          </div>
        </div>

        <div className="maison-footer-bottom">
          <p className="maison-footer-copy">© 2026 MAISON VÊTU. ALL RIGHTS RESERVED.</p>
          <div className="maison-footer-bottom-links">
            <span className="maison-footer-bottom-link">TERMS OF USE</span>
            <span className="maison-footer-bottom-link">PRIVACY POLICY</span>
            <span className="maison-footer-bottom-link">INTERNATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
