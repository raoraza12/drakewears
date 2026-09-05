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
        <div className="panel-body">
          {loading ? <p>Loading users...</p> : (
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
                        {user.name}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManager;
