import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../api';
import './Auth.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { token, password });
      toast.success(res.data.message || 'Password reset successfully!');
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired reset token. Please request a new link.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-card animate-fade-in">
        <div className="auth-brand text-script" style={{ fontSize: '3.5rem', lineHeight: 1, textTransform: 'none', background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>
          drakewears
        </div>
        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-sub">Enter your new secure password below.</p>

        {error && (
          <div className="auth-error-banner animate-fade-in" role="alert">
            <FiAlertCircle size={18} className="auth-error-icon" />
            <div className="auth-error-text">{error}</div>
            <button type="button" onClick={() => setError('')} className="auth-error-close" aria-label="Dismiss error">×</button>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FiCheckCircle size={32} color="#22c55e" />
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Password Updated!</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Redirecting you to login page...</p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/login" className="btn-primary" style={{ padding: '10px 24px', display: 'inline-block' }}>
                Go to Sign In Now
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="password-input-wrapper">
                <input 
                  className="form-input password-input" 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  placeholder="At least 6 characters" 
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input 
                className="form-input" 
                type={showPassword ? 'text' : 'password'} 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                placeholder="Re-enter new password" 
              />
            </div>

            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              <FiLock size={18} />
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/login" className="auth-link" style={{ fontSize: '0.88rem' }}>
                Cancel and return to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
