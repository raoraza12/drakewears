import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from 'react-icons/fi';
import API from '../../api';

const STATUS_COLORS = { pending: '#c9a84c', processing: '#9f7aea', shipped: '#38b2ac', delivered: '#55c688', cancelled: '#e05555' };

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="dashboard-container animate-fade-in"><p>Loading dashboard...</p></div>;
  }

  if (!stats) {
    return <div className="dashboard-container animate-fade-in"><p>Error loading dashboard data.</p></div>;
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <h1 className="h2" style={{ marginBottom: '32px' }}>Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="text-body" style={{ fontWeight: 500 }}>Total Revenue</h3>
            <div className="stat-icon"><FiDollarSign /></div>
          </div>
          <div className="stat-value h2" style={{ marginTop: '16px' }}>
            Rs. {stats.totalRevenue.toLocaleString()}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="text-body" style={{ fontWeight: 500 }}>Total Orders</h3>
            <div className="stat-icon"><FiShoppingBag /></div>
          </div>
          <div className="stat-value h2" style={{ marginTop: '16px' }}>{stats.ordersCount}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="text-body" style={{ fontWeight: 500 }}>Active Customers</h3>
            <div className="stat-icon"><FiUsers /></div>
          </div>
          <div className="stat-value h2" style={{ marginTop: '16px' }}>{stats.usersCount}</div>
        </div>
      </div>

      <div className="dashboard-content-grid" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Recent Orders */}
        <div className="admin-panel">
          <div className="panel-header">
            <h3 className="h3" style={{ fontSize: '1.25rem' }}>Recent Orders</h3>
          </div>
          <div className="panel-body">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.orders.slice(0, 5).map(order => (
                  <tr key={order.id || order._id}>
                    <td>#{String(order.id || order._id).slice(-6).toUpperCase()}</td>
                    <td>{order.shippingAddress?.name || order.user?.name || 'Unknown'}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className="status-badge" style={{ 
                        background: (STATUS_COLORS[order.status] || '#ccc') + '22', 
                        color: STATUS_COLORS[order.status] || '#ccc',
                        border: `1px solid ${STATUS_COLORS[order.status] || '#ccc'}44`
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td>Rs. {order.total.toLocaleString()}</td>
                  </tr>
                ))}
                {stats.orders.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="admin-panel">
          <div className="panel-header">
            <h3 className="h3" style={{ fontSize: '1.25rem' }}>Low Stock Alert</h3>
          </div>
          <div className="panel-body">
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map(product => (
                <div key={product.id || product._id} className="top-product-item" style={{ marginBottom: '16px' }}>
                  <div className="top-product-info">
                    <p className="text-body" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{product.name}</p>
                    <p className="text-caption" style={{ color: 'var(--red)' }}>{product.stock} left in stock</p>
                  </div>
                  <p className="text-body" style={{ fontWeight: 500 }}>Rs. {product.price}</p>
                </div>
              ))
            ) : (
              <p className="text-center" style={{ color: 'var(--text-secondary)' }}>All products have sufficient stock.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
