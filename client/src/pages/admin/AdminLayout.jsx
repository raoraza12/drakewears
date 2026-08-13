import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiHome, FiBox, FiUsers, FiShoppingBag, FiTag, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <FiHome size={18} /> },
    { name: 'Products', path: '/admin/products', icon: <FiBox size={18} /> },
    { name: 'Orders', path: '/admin/orders', icon: <FiShoppingBag size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <FiUsers size={18} /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <FiTag size={18} /> },
    { name: 'Settings', path: '/admin/settings', icon: <FiSettings size={18} /> },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
           <Link to="/" className="sidebar-logo">NOOR ADMIN</Link>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-item-link ${isActive ? 'active' : ''}`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <FiLogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">Panel Control</h1>
          <Link to="/" className="btn-ghost" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>View Website</Link>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
