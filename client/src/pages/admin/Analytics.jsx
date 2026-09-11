import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiUsers, FiActivity, FiArrowUpRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../api';
import './Admin.css';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    usersCount: 0,
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    avgWatchTime: '0'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Revenue', value: `$${data.totalRevenue.toLocaleString()}`, trend: '+12.5%', icon: <FiDollarSign /> },
    { title: 'Active Users', value: data.usersCount.toString(), trend: '+5.2%', icon: <FiUsers /> },
    { title: 'Total Sales', value: data.ordersCount.toString(), trend: '+18.1%', icon: <FiShoppingBag /> },
    { title: 'Total Products', value: data.productsCount.toString(), trend: '+2.1%', icon: <FiActivity /> }
  ];

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="h2" style={{ fontWeight: 600 }}>Analytics Overview</h1>
          <p className="text-body" style={{ marginTop: '4px' }}>Real-time metrics for drakewears store.</p>
        </div>
        <button className="btn-primary">
          <FiArrowUpRight style={{ marginRight: '8px' }} />
          Export Report
        </button>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginTop: '32px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card card-premium" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="text-caption">{stat.title}</p>
                <h3 className="h3" style={{ margin: '8px 0', fontSize: '2rem' }}>{stat.value}</h3>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '12px', color: 'var(--text-primary)' }}>
                {stat.icon}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px', fontSize: '0.875rem' }}>
              <span style={{ color: stat.negative ? '#e74c3c' : '#2ecc71', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <FiTrendingUp style={{ marginRight: '4px', transform: stat.negative ? 'rotate(180deg)' : 'none' }} />
                {stat.trend}
              </span>
              <span className="text-caption" style={{ marginLeft: '8px' }}>vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '32px' }}>
        <div className="card-premium" style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="text-body" style={{ fontWeight: 600, marginBottom: '24px' }}>Revenue Trends</h3>
          <div style={{ flex: 1, border: '1px dashed var(--border-medium)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
            [Interactive Chart Component Area]
          </div>
        </div>
        <div className="card-premium" style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="text-body" style={{ fontWeight: 600, marginBottom: '24px' }}>Top Categories</h3>
          <div style={{ flex: 1, border: '1px dashed var(--border-medium)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
            [Donut Chart Area]
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
