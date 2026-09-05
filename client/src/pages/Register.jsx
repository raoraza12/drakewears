import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUserPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to drakewears ✨');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card">
        <div className="auth-brand text-script" style={{ fontSize: '3.5rem', lineHeight: 1, textTransform: 'none', background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>drakewears</div>
        <h1 className="auth-title">Join drakewears</h1>
        <p className="auth-sub">Create your account and start shopping</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required placeholder="Ahmed Khan" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <input className="form-input password-input" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required placeholder="Min 6 characters" />
              <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            <FiUserPlus size={18} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign in &rarr;</Link>
        </p>
      </div>
    </div>
  );
}
