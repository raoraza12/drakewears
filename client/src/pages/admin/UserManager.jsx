import React, { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await API.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success('User role updated');
      setUsers(users.map(u => u.id === id || u._id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers(users.filter(u => u.id !== id && u._id !== id));
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="panel-header" style={{ padding: '0 0 24px 0', borderBottom: 'none' }}>
        <h1 className="h2">Users</h1>
        <p className="text-body" style={{ marginTop: '8px' }}>Manage customer accounts and admin access.</p>
      </div>

      <div className="admin-panel">
        <div className="panel-body" style={{ padding: '16px' }}>
          {loading ? <p>Loading users...</p> : (
            <>
              {/* Desktop Table View */}
              <div className="table-responsive desktop-table-view">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Joined</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No users found</td></tr>
                    ) : users.map(user => (
                      <tr key={user.id || user._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select 
                            className="form-input" 
                            style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto', background: user.role === 'admin' ? '#fff3cd' : 'var(--bg-primary)' }}
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id || user._id, e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => handleDeleteUser(user.id || user._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards-view admin-mobile-card-list">
                {users.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                    No users found.
                  </div>
                ) : users.map(user => {
                  const uId = user.id || user._id;
                  return (
                    <div key={uId} className="admin-mobile-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold, #c9a84c)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.88rem', fontWeight: 'bold' }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)', display: 'block' }}>{user.name}</strong>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{user.email}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <span>Phone: <strong style={{ color: 'var(--text-primary)' }}>{user.phone || 'N/A'}</strong></span>
                        <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="mobile-card-actions-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role:</span>
                          <select 
                            className="form-input" 
                            style={{ padding: '6px 10px', fontSize: '0.82rem', flex: 1, background: user.role === 'admin' ? '#fff3cd' : 'var(--bg-primary)' }}
                            value={user.role}
                            onChange={(e) => handleUpdateRole(uId, e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <button className="btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)', padding: '6px 14px' }} onClick={() => handleDeleteUser(uId)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManager;
