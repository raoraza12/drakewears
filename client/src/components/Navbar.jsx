import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiShoppingBag, FiUser, FiHeart, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
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

  // Theme Mode State: 'light' (White Major / Black Minor) vs 'dark' (Black Major / White Minor)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('drakewears_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('drakewears_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const location = useLocation();
  const { count, setIsOpen: setCartOpen } = useCart();
  const { user, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
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

  // Live Search Handler with Debounce
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
      {/* Main Full-Width Header (Outfitters Style) */}
      <header className={`outfitters-header ${isScrolled ? 'is-scrolled' : ''} ${location.pathname === '/' ? 'on-home' : 'on-inner'}`}>
        {/* Top Free Shipping Strip */}
        <div className="outfitters-top-strip">
          <span>ALL OVER PAKISTAN FREE SHIPPING ON ORDERS OVER RS. 5,000 | CASH ON DELIVERY</span>
        </div>

        <div className="outfitters-nav-bar">
          {/* Left Block: Hamburger + Brand Logo + Nav Links */}
          <div className="outfitters-nav-left">
            <button 
              className="outfitters-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <FiMenu size={22} />
            </button>

            <Link to="/" className="outfitters-brand-logo" aria-label="DrakeWears Home">
              <span className="outfitters-logo-text">drakewears</span>
            </Link>

            {/* Nav links right next to logo, exactly like Outfitters MEN, WOMEN, JUNIORS */}
            <nav className="outfitters-nav-links desktop-only">
              <Link to="/" className={`outfitters-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                HOME
              </Link>
              <Link to="/shop" className={`outfitters-nav-link ${location.pathname === '/shop' ? 'active' : ''}`}>
                SHOP
              </Link>
              <Link to="/about" className={`outfitters-nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
                ABOUT
              </Link>
              <Link to="/contact" className={`outfitters-nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                CONTACT
              </Link>
            </nav>
          </div>

          {/* Right Block: Search underline trigger + Account + Bag */}
          <div className="outfitters-nav-right">
            {/* Search Input Trigger with Underline (Outfitters Style) */}
            <div 
              className="outfitters-search-trigger"
              onClick={() => setSearchOpen(true)}
              role="button"
              tabIndex={0}
              title="Search products"
            >
              <FiSearch size={16} />
              <span className="outfitters-search-text">Search</span>
              <span className="outfitters-search-line"></span>
            </div>

            {/* Wishlist Link & Live Count */}
            <Link 
              to="/wishlist" 
              className="outfitters-icon-btn outfitters-wishlist-btn" 
              aria-label={`Wishlist, ${wishlistCount || 0} items`}
              title="Saved Wishlist"
            >
              <FiHeart size={19} />
              {wishlistCount > 0 && <span className="outfitters-bag-count">{wishlistCount}</span>}
            </Link>

            {/* User Account / Profile */}
            <div className="outfitters-profile-wrap">
              <button 
                className="outfitters-icon-btn" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="Account Menu"
                title="Account"
              >
                <FiUser size={19} />
              </button>

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
                        <Link to="/orders">My Orders</Link>
                        <Link to="/wishlist">Saved Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link>
                        {user.role === 'admin' && (
                          <Link to="/drakewearsofficial" style={{ color: '#2563eb', fontWeight: '700' }}>Admin Dashboard</Link>
                        )}
                        <button onClick={logout} className="logout-btn">Logout</button>
                      </div>
                    </>
                  ) : (
                    <div className="profile-links">
                      <Link to="/login" style={{ fontWeight: '700' }}>Login</Link>
                      <Link to="/register">Create Account</Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Bag Button */}
            <button 
              className="outfitters-icon-btn outfitters-bag-btn" 
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping Bag, ${count} items`}
              title="Shopping Bag"
            >
              <FiShoppingBag size={20} />
              {count > 0 && <span className="outfitters-bag-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Outfitters Mobile Drawer Menu */}
      <div className={`outfitters-drawer-overlay ${mobileMenuOpen ? 'is-open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <div className="outfitters-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="outfitters-drawer-header">
            <span className="outfitters-logo-text" style={{ fontSize: '1.6rem' }}>drakewears</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="drawer-theme-btn" 
                onClick={toggleTheme} 
                aria-label="Toggle dark/light theme"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <button className="outfitters-drawer-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <FiX size={22} />
              </button>
            </div>
          </div>

          <div className="outfitters-drawer-links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>SHOP ALL</Link>
            <div className="drawer-categories-sub">
              <Link to="/shop?category=baggy-trousers" onClick={() => setMobileMenuOpen(false)} className="drawer-sub-link">
                ↳ Baggy Trousers
              </Link>
              <Link to="/shop?category=drop-shoulder-tees" onClick={() => setMobileMenuOpen(false)} className="drawer-sub-link">
                ↳ Drop Shoulder Tees
              </Link>
              <Link to="/shop?category=hoodies" onClick={() => setMobileMenuOpen(false)} className="drawer-sub-link">
                ↳ Hoodies & Fleece
              </Link>
            </div>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>ABOUT US</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>CONTACT</Link>
          </div>

          <div className="outfitters-drawer-secondary">
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
              WISHLIST {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>TRACK ORDERS</Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>MY ACCOUNT ({user.name})</Link>
                {user.role === 'admin' && (
                  <Link to="/drakewearsofficial" onClick={() => setMobileMenuOpen(false)} style={{ color: '#3b82f6', fontWeight: 700 }}>
                    ADMIN PANEL →
                  </Link>
                )}
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="drawer-logout-btn">
                  LOGOUT
                </button>
              </>
            ) : (
              <div className="outfitters-drawer-auth">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ textAlign: 'center', padding: '12px' }}>
                  LOGIN / SIGN UP
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

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
                  placeholder="Search hoodies, baggy pants, oversized tees..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="search-modal-input" 
                />
              </div>
              <button className="search-close-btn" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <FiX size={24} />
              </button>
            </div>

            <div className="search-results-container">
              {searchLoading && <p style={{ padding: '24px', color: 'var(--text-secondary)' }}>Searching catalog...</p>}
              {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                <p style={{ padding: '24px', color: 'var(--text-secondary)' }}>No products found for "{searchQuery}"</p>
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
                        <p className="search-result-price">Rs. {p.price.toLocaleString()} • {p.category}</p>
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
