import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { FiHome, FiBox, FiShoppingCart, FiMessageCircle, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiBarChart2, FiLayers, FiAlertTriangle, FiStar, FiSidebar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const menuItems = [
    { path: '/admin', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
    { path: '/admin/products', icon: <FiBox />, label: 'Products' },
    { path: '/admin/categories', icon: <FiLayers />, label: 'Categories' },
    { path: '/admin/inventory', icon: <FiAlertTriangle />, label: 'Inventory' },
    { path: '/admin/reviews', icon: <FiStar />, label: 'Reviews' },
    { path: '/admin/orders', icon: <FiShoppingCart />, label: 'Web Orders' },
    { path: '/admin/whatsapp-orders', icon: <FiMessageCircle />, label: 'WhatsApp Orders' },
    { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' }
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="admin-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', padding: '4px 0' }}>
            <img src="/drakewears-logo.png?v=4" alt="drakewears" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <button 
            onClick={toggleSidebar} 
            title="Toggle Sidebar" 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <FiSidebar size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
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
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FiMenu size={24} />
          </button>
          
          <div className="admin-profile-container">
            <div className="admin-profile" onClick={toggleProfile}>
              <div className="avatar">{user.name ? user.name[0].toUpperCase() : 'A'}</div>
              <span className="admin-name">{user.name || 'Admin User'}</span>
            </div>
            
            {isProfileOpen && (
              <div className="profile-dropdown animate-slide-up">
                <div className="profile-dropdown-header">
                  <p className="text-body" style={{ fontWeight: 600 }}>{user.name}</p>
                  <p className="text-caption">{user.email}</p>
                </div>
                <div className="profile-dropdown-links">
                  <Link to="/admin/settings" onClick={() => setIsProfileOpen(false)}>Profile Settings</Link>
                  <Link to="/" onClick={() => setIsProfileOpen(false)}>Go to Website</Link>
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
