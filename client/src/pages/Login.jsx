import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiLogIn, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cleanEmail = form.email.trim();
      const cleanPassword = form.password.trim();
      const userData = await login(cleanEmail, cleanPassword);
      toast.success('Welcome back! ✨');
      if (userData.role === 'admin') {
        navigate('/drakewearsofficial');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please check your credentials and try again.';
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card">
        <div className="auth-brand text-script" style={{ fontSize: '3.5rem', lineHeight: 1, textTransform: 'none', background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>drakewears</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to your account to continue</p>

        {error && (
          <div className="auth-error-banner animate-fade-in" role="alert">
            <FiAlertCircle size={18} className="auth-error-icon" />
            <div className="auth-error-text">{error}</div>
            <button type="button" onClick={() => setError('')} className="auth-error-close" aria-label="Dismiss error">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-input" 
              type="email" 
              value={form.email} 
              onChange={e => { setError(''); setForm(p => ({...p, email: e.target.value})); }} 
              required 
              placeholder="you@example.com" 
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.8rem' }}>Forgot password?</Link>
            </div>
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

        <div className="auth-divider">
          <span className="auth-divider-line"></span>
          <span className="auth-divider-text">OR SIGN IN WITH</span>
          <span className="auth-divider-line"></span>
        </div>

        {/* 1-Click Google Sign In (Device Verified Account) */}
        <GoogleAuthButton redirect={redirect} isSignUp={false} onError={(msg) => setError(msg)} />

        <p className="auth-switch">
          Don't have an account? <Link to={redirect !== '/' ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'} className="auth-link">Create one &rarr;</Link>
        </p>

      </div>
    </div>
  );
}
