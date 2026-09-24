import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { FiHome, FiBox, FiShoppingCart, FiMessageCircle, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiBarChart2, FiLayers, FiAlertTriangle, FiStar, FiSidebar, FiTag, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 992;
    }
    return true;
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebarMobile = () => {
    if (window.innerWidth <= 992) {
      setIsSidebarOpen(false);
    }
  };
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', color: '#c9a84c', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #333', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ letterSpacing: '0.15em', fontSize: '0.85rem', textTransform: 'uppercase', color: '#888' }}>Verifying Admin Access...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/drakewearsofficial/login" replace />;
  }

  const menuItems = [
    { path: '/drakewearsofficial', icon: <FiHome />, label: 'Dashboard' },
    { path: '/drakewearsofficial/orders-summary', icon: <FiFileText />, label: 'Orders Summary' },
    { path: '/drakewearsofficial/orders', icon: <FiShoppingCart />, label: 'Web Orders' },
    { path: '/drakewearsofficial/whatsapp-orders', icon: <FiMessageCircle />, label: 'WhatsApp Orders' },
    { path: '/drakewearsofficial/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
    { path: '/drakewearsofficial/products', icon: <FiBox />, label: 'Products' },
    { path: '/drakewearsofficial/categories', icon: <FiLayers />, label: 'Categories' },
    { path: '/drakewearsofficial/coupons', icon: <FiTag />, label: 'Coupons' },
    { path: '/drakewearsofficial/inventory', icon: <FiAlertTriangle />, label: 'Inventory' },
    { path: '/drakewearsofficial/reviews', icon: <FiStar />, label: 'Reviews' },
    { path: '/drakewearsofficial/users', icon: <FiUsers />, label: 'Users' },
    { path: '/drakewearsofficial/settings', icon: <FiSettings />, label: 'Settings' }
  ];

  return (
    <div className="admin-container">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="admin-logo" onClick={closeSidebarMobile} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', padding: '4px 0' }}>
            <img src="/drakewears-logo.png?v=4" alt="drakewears" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <button 
            onClick={toggleSidebar} 
            title="Close / Toggle Sidebar" 
            className="sidebar-close-btn"
            style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '6px' }}
          >
            <span className="desktop-toggle-icon"><FiSidebar size={18} /></span>
            <span className="mobile-close-icon"><FiX size={18} /></span>
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={closeSidebarMobile}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item text-danger" onClick={logout} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span className="nav-icon"><FiLogOut /></span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-main ${isSidebarOpen ? '' : 'expanded'}`}>
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle navigation menu">
              <FiMenu size={22} />
            </button>
            <span className="admin-page-badge">Admin Suite</span>
          </div>
          
          <div className="admin-profile-container">
            <div className="admin-profile" onClick={toggleProfile}>
              <div className="avatar">{user.name ? user.name[0].toUpperCase() : 'A'}</div>
              <span className="admin-name">{user.name || 'Admin'}</span>
            </div>
            
            {isProfileOpen && (
              <div className="profile-dropdown animate-slide-up">
                <div className="profile-dropdown-header">
                  <p className="text-body" style={{ fontWeight: 600, color: '#fff' }}>{user.name}</p>
                  <p className="text-caption">{user.email}</p>
                </div>
                <div className="profile-dropdown-links">
                  <Link to="/drakewearsofficial/settings" onClick={() => { setIsProfileOpen(false); closeSidebarMobile(); }}>Settings</Link>
                  <Link to="/" onClick={() => { setIsProfileOpen(false); closeSidebarMobile(); }}>Storefront</Link>
                  <button onClick={logout} className="text-danger" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', fontSize: '0.875rem' }}>Logout</button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
