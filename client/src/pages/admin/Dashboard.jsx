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

      <div className="dashboard-content-grid" style={{ marginTop: '24px', display: 'grid', gap: '20px' }}>
        {/* Recent Orders */}
        <div className="admin-panel" style={{ minWidth: 0, overflow: 'hidden' }}>
          <div className="panel-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
            <h3 className="h3" style={{ fontSize: '1.15rem', margin: 0 }}>Recent Orders</h3>
          </div>
          <div className="panel-body" style={{ padding: '14px' }}>
            {stats.orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-secondary)' }}>
                <FiShoppingBag size={24} style={{ opacity: 0.3, marginBottom: '6px' }} />
                <p style={{ margin: 0, fontSize: '0.88rem' }}>No orders recorded yet.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="table-responsive desktop-orders-table">
                  <table className="admin-table" style={{ width: '100%', minWidth: '550px' }}>
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
                          <td><strong>{order.orderNumber ? `#${order.orderNumber}` : `#${String(order.id || order._id).slice(-6).toUpperCase()}`}</strong></td>
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
                    </tbody>
                  </table>
                </div>

                {/* Mobile Orders Card View (Visible only on mobile <= 920px) */}
                <div className="mobile-orders-view" style={{ display: 'none', flexDirection: 'column', gap: '10px' }}>
                  {stats.orders.slice(0, 5).map(order => (
                    <div key={order.id || order._id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {order.orderNumber ? `#${order.orderNumber}` : `#${String(order.id || order._id).slice(-6).toUpperCase()}`}
                        </strong>
                        <span className="status-badge" style={{ 
                          background: (STATUS_COLORS[order.status] || '#ccc') + '22', 
                          color: STATUS_COLORS[order.status] || '#ccc',
                          border: `1px solid ${STATUS_COLORS[order.status] || '#ccc'}44`,
                          fontSize: '0.72rem',
                          padding: '2px 8px'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span>{order.shippingAddress?.name || order.user?.name || 'Customer'}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-light)', paddingTop: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total:</span>
                        <strong style={{ color: 'var(--gold, #c9a84c)', fontSize: '0.92rem' }}>Rs. {order.total.toLocaleString()}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="admin-panel" style={{ minWidth: 0, overflow: 'hidden' }}>
          <div className="panel-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
            <h3 className="h3" style={{ fontSize: '1.15rem', margin: 0 }}>Low Stock Alert</h3>
          </div>
          <div className="panel-body" style={{ padding: '16px' }}>
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map(product => (
                <div key={product.id || product._id} className="top-product-item" style={{ marginBottom: '12px', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div className="top-product-info" style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-body" style={{ fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                    <p className="text-caption" style={{ color: 'var(--red)', margin: '2px 0 0 0', fontSize: '0.75rem' }}>{product.stock} left in stock</p>
                  </div>
                  <p className="text-body" style={{ fontWeight: 600, margin: 0, flexShrink: 0 }}>Rs. {product.price}</p>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-secondary)' }}>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>All products have sufficient stock.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
