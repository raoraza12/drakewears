import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { 
  FiPlus, 
  FiTrash2, 
  FiTag, 
  FiCopy, 
  FiCheck, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock, 
  FiLock,
  FiZap,
  FiShield
} from 'react-icons/fi';
import './Admin.css';

const DEFAULT_DAYS_AHEAD = 30;
const getDefaultExpiryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + DEFAULT_DAYS_AHEAD);
  return d.toISOString().split('T')[0];
};

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '20',
    usageMode: 'single', // 'single' (1-time only), 'limited' (N times), 'unlimited'
    usageLimit: '1',
    minPurchaseAmount: '0',
    expirationDate: getDefaultExpiryDate()
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await API.get('/admin/coupons');
      setCoupons(res.data || []);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = () => {
    const prefixes = ['DRAKE', 'VIP', 'OFFER', 'SPECIAL', 'DEAL'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generated = `${randomPrefix}-${randomChars}`;
    setFormData(prev => ({ ...prev, code: generated }));
    toast.success(`Generated code: ${generated}`);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Please enter or generate a coupon code');
      return;
    }

    const numVal = parseFloat(formData.discountValue);
    if (isNaN(numVal) || numVal <= 0) {
      toast.error('Please enter a valid discount amount');
      return;
    }

    let calculatedLimit = 1;
    if (formData.usageMode === 'single') {
      calculatedLimit = 1;
    } else if (formData.usageMode === 'unlimited') {
      calculatedLimit = 0;
    } else {
      calculatedLimit = Math.max(1, parseInt(formData.usageLimit, 10) || 1);
    }

    setCreating(true);
    try {
      await API.post('/admin/coupons', {
        code: cleanCode,
        discountType: formData.discountType,
        discountValue: numVal,
        minPurchaseAmount: parseFloat(formData.minPurchaseAmount) || 0,
        usageLimit: calculatedLimit,
        expirationDate: formData.expirationDate
      });

      toast.success(
        formData.usageMode === 'single'
          ? `Coupon ${cleanCode} deployed! (Single-use: will auto-expire after 1 customer order) 🎟️`
          : `Coupon ${cleanCode} activated successfully! 🎟️`
      );

      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '20',
        usageMode: 'single',
        usageLimit: '1',
        minPurchaseAmount: '0',
        expirationDate: getDefaultExpiryDate()
      });

      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await API.patch(`/admin/coupons/${id}/toggle`);
      toast.success(currentStatus ? 'Coupon paused' : 'Coupon reactivated! ✨');
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update coupon status');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      return;
    }
    try {
      await API.delete(`/admin/coupons/${id}`);
      toast.success(`Coupon ${code} deleted`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard! 📋`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Metrics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => {
    const isDateValid = !c.expirationDate || new Date(c.expirationDate) >= new Date();
    const isUsageValid = c.usageLimit === 0 || c.usedCount < c.usageLimit;
    return c.isActive && isDateValid && isUsageValid;
  }).length;
  const singleUseCoupons = coupons.filter(c => c.usageLimit === 1).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading coupon management...
      </div>
    );
  }

  return (
    <div className="coupon-manager-wrapper" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Coupons & Promotions
            </h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', border: '1px solid rgba(46, 125, 50, 0.2)' }}>
              Single-Use & Auto-Expiry Ready
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Create single-use or multi-use coupons. Single-use coupons automatically expire immediately after 1 customer places an order.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#fff', border: '1px solid var(--border-medium)', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Total Coupons</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalCoupons}</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--border-medium)', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2E7D32', fontWeight: 600, marginBottom: '6px' }}>Active & Ready</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2E7D32' }}>{activeCoupons}</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--border-medium)', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Single-Use (1-Time) Codes</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{singleUseCoupons}</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--border-medium)', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1565C0', fontWeight: 600, marginBottom: '6px' }}>Total Redemptions</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1565C0' }}>{totalRedemptions}</div>
        </div>
      </div>

      {/* Create Coupon Form Card */}
      <div style={{ background: '#fff', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <FiTag style={{ color: 'var(--primary, #000)' }} size={20} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Create New Promotional Code
          </h2>
        </div>

        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            
            {/* Promo Code */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Promo Code *
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  required
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                  className="form-input"
                  placeholder="e.g. VIP20"
                  style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="btn-outline"
                  title="Generate a random coupon code"
                  style={{ padding: '0 12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                >
                  <FiRefreshCw size={14} /> Auto
                </button>
              </div>
            </div>

            {/* Benefit Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Discount Type *
              </label>
              <select
                required
                value={formData.discountType}
                onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                className="form-input"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed">Fixed Currency Off (Rs.)</option>
                <option value="free_shipping">Free Delivery (Rs. 150)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                {formData.discountType === 'percentage' ? 'Percentage Off (%) *' : formData.discountType === 'fixed' ? 'Discount Amount (Rs.) *' : 'Shipping Discount (Rs.)'}
              </label>
              <input
                required
                type="number"
                min="1"
                max={formData.discountType === 'percentage' ? '100' : '99999'}
                value={formData.discountValue}
                onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                className="form-input"
                placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
                disabled={formData.discountType === 'free_shipping'}
              />
            </div>

            {/* Usage Mode Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Redemption Rule *
              </label>
              <select
                value={formData.usageMode}
                onChange={e => setFormData({ ...formData, usageMode: e.target.value, usageLimit: e.target.value === 'single' ? '1' : e.target.value === 'unlimited' ? '0' : '5' })}
                className="form-input"
                style={{ fontWeight: 600 }}
              >
                <option value="single">Single Use (1 Time Only - Auto Expires)</option>
                <option value="limited">Limited Uses (Custom Limit)</option>
                <option value="unlimited">Unlimited Uses (Campaign / Public)</option>
              </select>
            </div>

            {/* Custom Usage Limit (Only if limited) */}
            {formData.usageMode === 'limited' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Total Times Allowed *
                </label>
                <input
                  required
                  type="number"
                  min="2"
                  value={formData.usageLimit}
                  onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 10"
                />
              </div>
            )}

            {/* Min Purchase */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Min Order Amount (Rs.)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minPurchaseAmount}
                onChange={e => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                className="form-input"
                placeholder="0 = No minimum"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Valid Until (Expiry Date) *
              </label>
              <input
                required
                type="date"
                value={formData.expirationDate}
                onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          {/* Usage Rule Helpful Note */}
          <div style={{
            background: formData.usageMode === 'single' ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${formData.usageMode === 'single' ? '#bbf7d0' : '#e2e8f0'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.84rem',
            color: formData.usageMode === 'single' ? '#166534' : 'var(--text-secondary)'
          }}>
            {formData.usageMode === 'single' ? (
              <>
                <FiZap size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span>
                  <strong>Single-Use Security:</strong> Once you give this code to a customer and they place an order with it, the system will <strong>instantly auto-expire and lock</strong> this coupon. Neither they nor anyone else can reuse it again!
                </span>
              </>
            ) : formData.usageMode === 'limited' ? (
              <>
                <FiShield size={18} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span>
                  This coupon can be redeemed a total of <strong>{formData.usageLimit} times</strong> across customers, after which it will automatically deactivate.
                </span>
              </>
            ) : (
              <>
                <FiCheckCircle size={18} style={{ color: '#64748b', flexShrink: 0 }} />
                <span>
                  This coupon can be used an unlimited number of times until its expiry date.
                </span>
              </>
            )}
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary"
              style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700 }}
            >
              <FiPlus size={18} />
              {creating ? 'Activating Coupon...' : 'Activate & Deploy Coupon'}
            </button>
          </div>
        </form>
      </div>

      {/* Coupons List Section */}
      <div style={{ background: '#fff', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Active Promotional Codes ({coupons.length})
          </h2>
          <button
            onClick={fetchCoupons}
            className="btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="table-responsive desktop-table-view">
          <table className="admin-table" style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 14px' }}>Coupon Code</th>
                <th style={{ padding: '12px 14px' }}>Discount</th>
                <th style={{ padding: '12px 14px' }}>Redemptions & Limit</th>
                <th style={{ padding: '12px 14px' }}>Min. Spend</th>
                <th style={{ padding: '12px 14px' }}>Validity</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
                    <FiTag size={32} style={{ opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                    No coupons deployed yet. Use the form above to create your first promotion!
                  </td>
                </tr>
              ) : (
                coupons.map(coupon => {
                  const isExpired = coupon.expirationDate && new Date(coupon.expirationDate) < new Date();
                  const isExhausted = coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;
                  const isSingleUse = coupon.usageLimit === 1;

                  let statusBadge = null;
                  if (!coupon.isActive) {
                    if (isExhausted) {
                      statusBadge = (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}>
                          Used Up & Expired
                        </span>
                      );
                    } else {
                      statusBadge = (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>
                          Paused
                        </span>
                      );
                    }
                  } else if (isExpired) {
                    statusBadge = (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
                        Date Expired
                      </span>
                    );
                  } else if (isExhausted) {
                    statusBadge = (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}>
                        Limit Reached
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                        {isSingleUse ? '⚡ Active (Single-Use)' : '🟢 Active'}
                      </span>
                    );
                  }

                  return (
                    <tr key={coupon.id || coupon._id} style={{ opacity: (!coupon.isActive || isExpired || isExhausted) ? 0.75 : 1 }}>
                      <td style={{ padding: '14px', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(coupon.code)}
                            title="Copy code to clipboard"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: copiedCode === coupon.code ? '#16a34a' : 'var(--text-secondary)' }}
                          >
                            {copiedCode === coupon.code ? <FiCheck size={14} /> : <FiCopy size={14} />}
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '14px', fontWeight: 600 }}>
                        {coupon.discountType === 'percentage' && `${coupon.discountValue}% OFF`}
                        {coupon.discountType === 'fixed' && `Rs. ${coupon.discountValue.toLocaleString()} OFF`}
                        {coupon.discountType === 'free_shipping' && 'Free Delivery (Rs. 150)'}
                      </td>

                      <td style={{ padding: '14px' }}>
                        {isSingleUse ? (
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: coupon.usedCount >= 1 ? '#64748b' : '#16a34a' }}>
                            {coupon.usedCount >= 1 ? '🔒 1 / 1 (Used & Expired)' : '✨ 0 / 1 (Available for 1 User)'}
                          </span>
                        ) : coupon.usageLimit > 0 ? (
                          <span style={{ fontSize: '0.82rem' }}>
                            {coupon.usedCount} / {coupon.usageLimit} uses
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {coupon.usedCount} used (Unlimited)
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px', fontSize: '0.85rem' }}>
                        {coupon.minPurchaseAmount > 0 ? `Rs. ${coupon.minPurchaseAmount.toLocaleString()}` : 'None'}
                      </td>

                      <td style={{ padding: '14px', fontSize: '0.85rem', color: isExpired ? '#dc2626' : 'var(--text-secondary)' }}>
                        {new Date(coupon.expirationDate).toLocaleDateString()}
                      </td>

                      <td style={{ padding: '14px' }}>
                        {statusBadge}
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggle(coupon.id || coupon._id, coupon.isActive)}
                            className="btn-outline"
                            style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
                            title={coupon.isActive ? 'Pause coupon' : 'Reactivate coupon'}
                          >
                            {coupon.isActive ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(coupon.id || coupon._id, coupon.code)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' }}
                            title="Delete coupon"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="mobile-cards-view admin-mobile-card-list">
          {coupons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
              No coupons deployed yet.
            </div>
          ) : (
            coupons.map(coupon => {
              const isExpired = coupon.expirationDate && new Date(coupon.expirationDate) < new Date();
              const isExhausted = coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;
              const isSingleUse = coupon.usageLimit === 1;

              return (
                <div 
                  key={coupon.id || coupon._id} 
                  className="admin-mobile-card"
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiTag size={16} style={{ color: 'var(--text-primary)' }} />
                      <strong style={{ fontSize: '1.05rem', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                        {coupon.code}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(coupon.code)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: '#f1f5f9', color: 'var(--text-primary)' }}>
                      {coupon.discountType === 'percentage' && `${coupon.discountValue}% OFF`}
                      {coupon.discountType === 'fixed' && `Rs. ${coupon.discountValue} OFF`}
                      {coupon.discountType === 'free_shipping' && 'Free Ship'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {isSingleUse ? (
                      <span style={{ fontWeight: 600, color: coupon.usedCount >= 1 ? '#64748b' : '#16a34a' }}>
                        {coupon.usedCount >= 1 ? '🔒 1/1 Used (Self-Expired)' : '✨ 0/1 Used (Single-Use Active)'}
                      </span>
                    ) : (
                      <span>Redemptions: {coupon.usedCount} {coupon.usageLimit > 0 ? `/ ${coupon.usageLimit}` : '(Unlimited)'}</span>
                    )}
                    <div>Valid until: {new Date(coupon.expirationDate).toLocaleDateString()}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(coupon.id || coupon._id, coupon.isActive)}
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      {coupon.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(coupon.id || coupon._id, coupon.code)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
