import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(form.email, form.password);
      toast.success('Welcome back! ✨');
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card">
        <div className="auth-brand text-script" style={{ fontSize: '3.5rem', lineHeight: 1, textTransform: 'none', background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>drakewears</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to your account to continue</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input className="form-input password-input" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required placeholder="••••••••" />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            <FiLogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register" className="auth-link">Create one &rarr;</Link>
        </p>

      </div>
    </div>
  );
}
