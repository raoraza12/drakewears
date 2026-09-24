import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanEmail = form.email.trim();
      const cleanPassword = form.password.trim();
      const userData = await login(cleanEmail, cleanPassword);
      if (userData.role === 'admin') {
        toast.success('Admin access granted.');
        window.location.href = '/drakewearsofficial';
      } else {
        toast.error('Unauthorized access. Admin privileges required.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.response?.data?.message || (err.message === 'Network Error' ? 'Network Error: Please check connection or reload.' : err.message) || 'Login failed';
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: 'clamp(24px, 6vw, 40px)', backgroundColor: '#141414', borderRadius: '14px', border: '1px solid #333', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="text-script" style={{ fontSize: '3rem', color: '#fff', margin: 0, lineHeight: 1 }}>drakewears</h1>
          <p style={{ color: '#888', marginTop: '8px', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#ccc', fontSize: '0.85rem', fontWeight: '500' }}>Email Address</label>
            <input 
              type="email" 
              value={form.email} 
              onChange={e => setForm(p => ({...p, email: e.target.value}))} 
              required 
              style={{ padding: '14px', backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none' }} 
              placeholder="Enter your email" 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#ccc', fontSize: '0.85rem', fontWeight: '500' }}>Master Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={form.password} 
                onChange={e => setForm(p => ({...p, password: e.target.value}))} 
                required 
                style={{ width: '100%', padding: '14px', paddingRight: '40px', backgroundColor: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none' }} 
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              marginTop: '12px', 
              padding: '14px', 
              backgroundColor: '#fff', 
              color: '#000', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: '600', 
              fontSize: '1rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
          >
            <FiLock size={18} />
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a href="/" style={{ color: '#666', fontSize: '0.85rem', textDecoration: 'none' }}>&larr; Back to Storefront</a>
        </div>
      </div>
    </div>
  );
}
