import React, { useState, useEffect } from 'react';
import { FiStar, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('drakewears_token');
      const res = await axios.get(`${API_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem('drakewears_token');
      await axios.put(`${API_URL}/admin/reviews/${id}/status`, { status: action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(reviews.map(r => r.id === id ? { ...r, status: action } : r));
      toast.success(`Review ${action.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="h2" style={{ fontWeight: 600 }}>Review & Rating Moderation</h1>
          <p className="text-body" style={{ marginTop: '4px' }}>Approve or hide customer feedback.</p>
        </div>
      </div>

      <div className="card-premium">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="text-body" style={{ fontWeight: 500 }}>Recent Reviews</div>
        </div>
        
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Customer</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Product</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Rating</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 500 }}>{review.customer}</div>
                  <div className="text-caption" style={{ marginTop: '4px' }}>{review.date}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 500 }}>{review.product}</div>
                  <div className="text-body" style={{ marginTop: '4px', fontSize: '0.875rem' }}>"{review.comment}"</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', color: '#f1c40f' }}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} fill={i < review.rating ? '#f1c40f' : 'none'} style={{ marginRight: '2px' }} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: review.status === 'Approved' ? '#e8f5e9' : (review.status === 'Hidden' ? '#ffebee' : '#fff3e0'),
                    color: review.status === 'Approved' ? '#2e7d32' : (review.status === 'Hidden' ? '#c0392b' : '#e67e22')
                  }}>
                    {review.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  {review.status === 'Pending' && (
                    <>
                      <button className="btn-icon" onClick={() => handleAction(review.id, 'Approved')} style={{ color: '#2ecc71', marginRight: '8px' }} title="Approve"><FiCheck /></button>
                      <button className="btn-icon" onClick={() => handleAction(review.id, 'Hidden')} style={{ color: '#e74c3c' }} title="Hide"><FiX /></button>
                    </>
                  )}
                  {review.status !== 'Pending' && (
                     <button className="btn-icon" style={{ color: 'var(--text-secondary)' }} title="Reply"><FiMessageSquare /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewManager;
