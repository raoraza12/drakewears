import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUserPlus, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import './Auth.css';

const KNOWN_FAKE_DOMAINS = [
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com',
  'guerrillamail.com', 'throwawaymail.com', 'yopmail.com', 'sharklasers.com',
  'fake.com', 'test.com', 'example.com', 'trashmail.com', 'fakeinbox.com'
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = form.email.trim().toLowerCase();

    // Client-side validation against fake/dummy emails
    if (!emailTrimmed.includes('@') || !emailTrimmed.includes('.')) {
      setError('Please provide a valid email format (e.g. name@gmail.com)');
      return;
    }

    const domain = emailTrimmed.split('@')[1] || '';
    if (KNOWN_FAKE_DOMAINS.some(d => domain.includes(d) || domain.startsWith('fake') || domain.startsWith('temp'))) {
      setError('Temporary and fake emails are not allowed. Please use your real email (e.g. Gmail) or click "Sign up with Google".');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form.name.trim(), emailTrimmed, form.password);
      toast.success('Account created! Welcome to drakewears ✨');
      navigate(redirect);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details and try again.';
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card">
        <div className="auth-brand text-script" style={{ fontSize: '3.5rem', lineHeight: 1, textTransform: 'none', background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>drakewears</div>
        <h1 className="auth-title">Join drakewears</h1>
        <p className="auth-sub">Create your account and start shopping</p>

        {error && (
          <div className="auth-error-banner animate-fade-in" role="alert">
            <FiAlertCircle size={18} className="auth-error-icon" />
            <div className="auth-error-text">{error}</div>
            <button type="button" onClick={() => setError('')} className="auth-error-close" aria-label="Dismiss error">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-input" 
              type="text" 
              value={form.name} 
              onChange={e => { setError(''); setForm(p => ({...p, name: e.target.value})); }} 
              required 
              placeholder="Full Name" 
            />
          </div>
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

        <div className="auth-divider">
          <span className="auth-divider-line"></span>
          <span className="auth-divider-text">OR SIGN UP WITH</span>
          <span className="auth-divider-line"></span>
        </div>

        {/* 1-Click Google Sign Up (Device Verified Account) */}
        <GoogleAuthButton redirect={redirect} isSignUp={true} onError={(msg) => setError(msg)} />

        <p className="auth-switch">
          Already have an account? <Link to={redirect !== '/' ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} className="auth-link">Sign in &rarr;</Link>
        </p>
      </div>
    </div>
  );
}
