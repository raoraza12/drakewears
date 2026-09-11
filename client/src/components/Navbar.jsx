import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import API from '../api';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const location = useLocation();
  const { count, setIsOpen: setCartOpen } = useCart();
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setSearchOpen(false);
  }, [location]);

  // Live Search Handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchLoading(true);
      API.get(`/products?search=${encodeURIComponent(searchQuery)}`)
        .then(res => {
          setSearchResults(res.data.products || []);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <>
      {/* Top Free Shipping Announcement Bar */}
      <div className="announcement-bar">
        <span>⚡ FREE SHIPPING ON ALL ORDERS OVER RS. 4000 | USE CODE: <strong>DRAKEFREESHIP</strong> ⚡</span>
      </div>

      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Left: Mobile Menu & Logo */}
          <div className="nav-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <Link to="/" className="navbar-logo" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', padding: '4px 12px', marginRight: '24px' }}>
              <img src="/drakewears-logo.png?v=4" alt="drakewears" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
            </Link>
          </div>

          {/* Center: Desktop Links */}
          <div className="nav-center desktop-only">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Shop</Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About us</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact us</Link>
          </div>

          {/* Right: Icons & Cart */}
          <div className="nav-right desktop-only">
            <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <FiSearch size={20} />
            </button>
            
            <div className="profile-menu-container" style={{ position: 'relative' }}>
              <button className="icon-btn" aria-label="Profile" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <FiUser size={20} />
              </button>
              
              {/* Profile Card */}
              {profileDropdownOpen && (
                <div className="profile-dropdown-card">
                  {user ? (
                    <>
                      <div className="profile-header">
                        <p className="profile-name">{user.name}</p>
                        <p className="profile-email">{user.email}</p>
                      </div>
                      <div className="profile-links">
                        <Link to="/profile">My Profile</Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" style={{ color: '#007BFF', fontWeight: '500' }}>Admin Dashboard</Link>
                        )}
                        <button onClick={logout} className="logout-btn">Logout</button>
                      </div>
                    </>
                  ) : (
                    <div className="profile-links">
                      <Link to="/login" style={{ fontWeight: '500' }}>Login</Link>
                      <Link to="/register">Register</Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Link Style [ Cart (0) ] */}
            <button 
              className="nav-cart-btn" 
              onClick={() => setCartOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500 }}
            >
              [ Cart ({count}) ]
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-links">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact us</Link>
          </div>
        </div>
      </nav>

      {/* Live Search Modal Overlay */}
      {searchOpen && (
        <div className="search-overlay">
          <div className="search-modal">
            <div className="search-header">
              <div className="search-input-wrap">
                <FiSearch size={20} className="search-icon-input" />
                <input 
                  type="text" 
                  autoFocus 
                  placeholder="Search products by name or category..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="search-modal-input" 
                />
              </div>
              <button className="search-close-btn" onClick={() => setSearchOpen(false)}>
                <FiX size={24} />
              </button>
            </div>

            <div className="search-results-container">
              {searchLoading && <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>Searching products...</p>}
              {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>No products found for "{searchQuery}"</p>
              )}
              {!searchLoading && searchResults.length > 0 && (
                <div className="search-results-list">
                  {searchResults.map(p => (
                    <Link 
                      key={p._id || p.id} 
                      to={`/shop/${p.slug}`} 
                      className="search-result-item" 
                      onClick={() => setSearchOpen(false)}
                    >
                      <img src={p.images?.[0] || 'https://via.placeholder.com/60'} alt={p.name} />
                      <div className="search-result-info">
                        <h4>{p.name}</h4>
                        <p className="search-result-price">Rs. {p.price} • {p.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Navbar;
