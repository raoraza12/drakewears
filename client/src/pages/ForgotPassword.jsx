import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Please enter your registered email address');

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setResetUrl('');

    try {
      const res = await API.post('/auth/forgot-password', { email: email.trim() });
      setSuccessMsg(res.data.message || 'Password reset link sent!');
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
      toast.success('Reset instructions generated!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not process request. Please try again.';
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
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-sub">Enter your email and we'll send you instructions to reset your password.</p>

        {error && (
          <div className="auth-error-banner animate-fade-in" role="alert">
            <FiAlertCircle size={18} className="auth-error-icon" />
            <div className="auth-error-text">{error}</div>
            <button type="button" onClick={() => setError('')} className="auth-error-close" aria-label="Dismiss error">×</button>
          </div>
        )}

        {successMsg ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FiCheckCircle size={32} color="#22c55e" />
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>{successMsg}</p>
            {resetUrl && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'left', wordBreak: 'break-all' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Direct Reset Link (Local/Test):</p>
                <a href={resetUrl} style={{ color: 'var(--gold)', fontSize: '0.85rem', textDecoration: 'underline' }}>
                  Proceed to Reset Password &rarr;
                </a>
              </div>
            )}
            <div style={{ marginTop: '24px' }}>
              <Link to="/login" className="btn-primary" style={{ padding: '12px 24px', display: 'inline-block' }}>
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Registered Email</label>
              <input 
                className="form-input" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com" 
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              <FiMail size={18} />
              {loading ? 'Sending Instructions...' : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                <FiArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
