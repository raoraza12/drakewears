import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiSearch, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenu, setUserMenu] = useState(false);
  
  const { user, logout } = useAuth();
  const { count, setIsOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenu(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery.trim()}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <div className="maison-marquee">
        <div className="marquee-content">
          <span>COMPLIMENTARY WORLDWIDE SHIPPING ON ORDERS OVER $500</span>
          <span>COMPLIMENTARY WORLDWIDE SHIPPING ON ORDERS OVER $500</span>
          <span>COMPLIMENTARY WORLDWIDE SHIPPING ON ORDERS OVER $500</span>
          <span>COMPLIMENTARY WORLDWIDE SHIPPING ON ORDERS OVER $500</span>
        </div>
      </div>
      
      <nav className={`navbar maison-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner container">
          
          {/* Left: Desktop Links */}
          <div className="navbar-links">
            <Link to="/shop?newArrival=true" className="nav-link">NEW ARRIVALS</Link>
            <Link to="/shop?category=Women" className="nav-link">CLOTHING</Link>
            <Link to="/accessories" className="nav-link">ACCESSORIES</Link>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-text">MAISON VÊTU</span>
          </Link>

          {/* Right: Actions */}
          <div className="navbar-actions">
            <button className="nav-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <FiSearch size={18} strokeWidth={1.5} />
            </button>
            
            <div className="user-menu-wrap">
              <button className="nav-icon-btn" onClick={() => user ? setUserMenu(!userMenu) : navigate('/login')} aria-label="Account">
                <FiUser size={18} strokeWidth={1.5} />
              </button>
              {userMenu && user && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <span className="user-name">{user.name}</span>
                  </div>
                  <Link to="/profile" className="user-dropdown-item">Profile</Link>
                  <Link to="/orders" className="user-dropdown-item">Orders</Link>
                  <Link to="/wishlist" className="user-dropdown-item">Wishlist</Link>
                  {user.role === 'admin' && <Link to="/admin" className="user-dropdown-item" style={{color: 'var(--gold)'}}>Admin</Link>}
                  <button className="user-dropdown-item logout" onClick={() => { logout(); setUserMenu(false); }}>Logout</button>
                </div>
              )}
            </div>
            
            <button className="nav-icon-btn cart-btn" onClick={() => setIsOpen(true)} aria-label="Cart">
              <FiShoppingBag size={18} strokeWidth={1.5} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>
            
            <button className="nav-icon-btn mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <>
          <div className="overlay" onClick={() => setSearchOpen(false)} />
          <div className="search-modal">
            <form onSubmit={handleSearch} className="search-form">
              <FiSearch size={20} className="search-icon" />
              <input className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="SEARCH..." autoFocus />
              <button type="button" className="search-close" onClick={() => setSearchOpen(false)}><FiX size={20} /></button>
            </form>
          </div>
        </>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div className="overlay" onClick={() => setMobileOpen(false)} />
          <div className="mobile-menu">
            <div className="mobile-menu-logo">MAISON VÊTU</div>
            <Link to="/shop?newArrival=true" className="mobile-cat-title">NEW ARRIVALS</Link>
            <Link to="/shop?category=Women" className="mobile-cat-title">CLOTHING</Link>
            <Link to="/accessories" className="mobile-cat-title">ACCESSORIES</Link>
            
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)' }}>
              {user ? (
                <>
                  <Link to="/profile" className="mobile-cat-title">ACCOUNT</Link>
                  <button onClick={logout} className="mobile-cat-title" style={{ background: 'none', textAlign: 'left', width: '100%', cursor:'pointer' }}>SIGN OUT</button>
                </>
              ) : (
                <Link to="/login" className="mobile-cat-title">SIGN IN</Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
