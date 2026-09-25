import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiSave, FiLock, FiEye, FiEyeOff, FiShield, FiCheck } from 'react-icons/fi';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', avatar: '' });
  const [loading, setLoading] = useState(false);

  // Password state
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (user) { 
      setForm({ 
        name: user.name || '', 
        phone: user.phone || '', 
        avatar: user.avatar || '' 
      }); 
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put('/users/profile', form);
      if (setUser) {
        setUser(prev => ({ ...prev, ...res.data }));
      }
      toast.success('Profile details updated!');
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to update profile'); 
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!pwdForm.newPassword || pwdForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('New passwords do not match. Please verify.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await API.put('/users/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });

      toast.success(res.data?.message || 'Password updated and saved successfully! 🔐');

      // Native Device / Browser Credential Management API (Prompts Google / iOS Password Manager to save)
      if (window.PasswordCredential && navigator.credentials) {
        try {
          const cred = new window.PasswordCredential({
            id: user.email,
            password: pwdForm.newPassword,
            name: user.name || user.email
          });
          await navigator.credentials.store(cred);
        } catch {
          // Non-critical fallback; standard form submission already triggers browser autofill prompt
        }
      }

      setPwdForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (!user) return (
    <div className="page-wrapper empty-page">
      <FiUser size={56} color="var(--text-muted)" />
      <p>Please login to view profile</p>
    </div>
  );

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="container" style={{ maxWidth: 640, paddingTop: 40, paddingBottom: 80 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: 'var(--cream)', marginBottom: 28, fontWeight: 600 }}>
          My Account
        </h1>

        <div style={{ background: 'var(--bg-card, #141414)', border: '1px solid var(--border-light, #27272a)', borderRadius: '16px', padding: 'clamp(20px, 4vw, 32px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          {/* User Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border-light, #27272a)' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold, #c9a84c), #e5c158)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', fontWeight: 700, color: '#111', flexShrink: 0 }}>
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', color: 'var(--cream, #fff)', fontWeight: 600, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.name}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #a1a1aa)', marginTop: 4, margin: '4px 0 0 0' }}>
                {user.email}
              </p>
              <span style={{ display: 'inline-block', marginTop: 6, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold, #c9a84c)', fontWeight: 700, background: 'rgba(201,168,76,0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                {user.role} Account
              </span>
            </div>
          </div>

          {/* 1. Personal Information Section */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--cream, #fff)', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiUser color="var(--gold, #c9a84c)" /> Personal Information
            </h2>
            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', color: '#ccc', marginBottom: 6 }}>Display Name</label>
                <input 
                  className="form-input" 
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                  required 
                  style={{ width: '100%', padding: '12px 14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', color: '#ccc', marginBottom: 6 }}>Phone Number</label>
                <input 
                  className="form-input" 
                  value={form.phone} 
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} 
                  placeholder="0300-1234567" 
                  style={{ width: '100%', padding: '12px 14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: 6 }}>Email Address (Registered)</label>
                <input 
                  className="form-input" 
                  value={user.email} 
                  readOnly 
                  style={{ width: '100%', padding: '12px 14px', background: '#0e0e0e', border: '1px solid #222', color: '#777', borderRadius: '8px', cursor: 'not-allowed' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}>
                  <FiSave size={16} /> {loading ? 'Saving...' : 'Save Profile'}
                </button>
                <button type="button" className="btn-outline" onClick={logout} style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid #444', color: '#ccc', cursor: 'pointer' }}>
                  Log Out
                </button>
              </div>
            </form>
          </div>

          {/* 2. Password & Security Section (With View Password & Device Keychain Save) */}
          <div style={{ paddingTop: 28, borderTop: '1px solid var(--border-light, #27272a)' }}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--cream, #fff)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <FiLock color="var(--gold, #c9a84c)" /> Security & Password
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted, #a1a1aa)', marginTop: 4 }}>
                Update your account password and save it securely in your phone or browser keychain.
              </p>
            </div>

            <form onSubmit={handlePasswordUpdate} autoComplete="on">
              {/* Hidden username field for browser password managers */}
              <input 
                type="text" 
                name="username" 
                value={user.email} 
                autoComplete="username" 
                readOnly 
                style={{ display: 'none' }} 
              />

              {/* Current Password */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', color: '#ccc', marginBottom: 6 }}>
                  Current Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    name="current-password"
                    autoComplete="current-password"
                    className="form-input"
                    value={pwdForm.currentPassword}
                    onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    style={{ width: '100%', padding: '12px 42px 12px 14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title={showCurrent ? 'Hide password' : 'Show password'}
                  >
                    {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', color: '#ccc', marginBottom: 6 }}>
                  New Password (min 6 characters)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    name="new-password"
                    autoComplete="new-password"
                    className="form-input"
                    value={pwdForm.newPassword}
                    onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    style={{ width: '100%', padding: '12px 42px 12px 14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '0.85rem', color: '#ccc', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm-new-password"
                    autoComplete="new-password"
                    className="form-input"
                    value={pwdForm.confirmPassword}
                    onChange={e => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                    style={{ width: '100%', padding: '12px 42px 12px 14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={pwdLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: '8px', fontWeight: 600, background: 'var(--gold, #c9a84c)', color: '#000', border: 'none', cursor: 'pointer' }}
                >
                  <FiShield size={16} /> {pwdLoading ? 'Updating...' : 'Save & Update Password'}
                </button>
                <span style={{ fontSize: '0.78rem', color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiCheck color="#22c55e" size={14} /> Saves to Google & Device Keychain
                </span>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
