import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle, 
  FiXCircle, 
  FiMessageCircle, 
  FiLoader 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered by mistake',
  'Found better price elsewhere',
  'Delivery taking too long',
  'Want to change shipping address or items',
  'Other'
];

export default function OrderTracking() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [verificationPhone, setVerificationPhone] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!query.trim()) return setError('Please enter your Order ID or registered Phone Number');

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await API.get(`/orders/track/${encodeURIComponent(query.trim())}`);
      setOrder(res.data);
      // Pre-fill phone if search query looks like a phone number
      const cleanQ = query.trim().replace(/[^0-9]/g, '');
      if (cleanQ.length >= 10) {
        setVerificationPhone(query.trim());
      } else {
        setVerificationPhone('');
      }
      toast.success('Order found!');
    } catch (err) {
      const msg = err.response?.data?.message || 'No order found with the provided details. Please verify and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelModal = () => {
    setCancelReason(CANCEL_REASONS[0]);
    setOtherReasonText('');
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    if (submittingCancel) return;
    setShowCancelModal(false);
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    const orderId = order.id || order._id;
    const finalReason = cancelReason === 'Other' 
      ? (otherReasonText.trim() || 'Other reason') 
      : cancelReason;

    // For guests, verification phone is required
    if (!user && !verificationPhone.trim()) {
      toast.error('Please enter your registered phone number to verify identity.');
      return;
    }

    setSubmittingCancel(true);
    try {
      await API.patch(`/orders/${orderId}/cancel`, {
        reason: finalReason,
        phone: verificationPhone.trim()
      });

      toast.success('Your order has been cancelled successfully.');
      setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
      setShowCancelModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order. Please check details or contact support.';
      toast.error(msg);
    } finally {
      setSubmittingCancel(false);
    }
  };

  const getStatusStep = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'processing' || s === 'confirmed' || s === 'approved') return 2;
    if (s === 'cancelled') return -1;
    return 1; // pending
  };

  const currentStep = order ? getStatusStep(order.status) : 0;
  const statusKey = (order?.status || '').toLowerCase();
  const isCancellable = ['pending', 'confirmed', 'processing'].includes(statusKey);
  const isShippedOrDelivered = ['shipped', 'delivered'].includes(statusKey);
  const isCancelled = statusKey === 'cancelled';
  const orderNumDisplay = order?.orderNumber ? `#${order.orderNumber}` : `#${shortId}`;
  const waSupportUrl = `https://wa.me/923218254922?text=Hello%20DRAKEWEARS,%20I%20need%20assistance%20cancelling%20Order%20${encodeURIComponent(orderNumDisplay)}.`;

  return (
    <div className="page-wrapper" style={{ minHeight: '80vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            DRAKEWEARS DISPATCH PIPELINE
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.6rem)', fontWeight: 800, margin: '8px 0 12px' }}>Track Your Order</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Enter your Order Number (e.g. #1), Order ID, or Phone Number to view live dispatch status.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '12px', marginBottom: '36px' }}>
          <input 
            type="text" 
            className="form-input" 
            style={{ flex: 1, padding: '14px 18px', fontSize: '1rem' }}
            placeholder="e.g. 1, #1, 03218254922, or Order ID"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 28px', display: 'flex', alignItems: 'center', gap: '8px' }} disabled={loading}>
            <FiSearch size={18} />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="auth-error-banner animate-fade-in" role="alert" style={{ marginBottom: '24px' }}>
            <FiAlertCircle size={18} className="auth-error-icon" />
            <div className="auth-error-text">{error}</div>
          </div>
        )}

        {/* Order Details Card */}
        {order && (
          <div className="admin-panel animate-fade-in" style={{ padding: '28px', borderRadius: '16px', border: '1px solid var(--border-medium)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Order {orderNumDisplay}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '4px 14px', 
                    borderRadius: '20px', 
                    fontSize: '0.82rem', 
                    fontWeight: 800, 
                    textTransform: 'uppercase',
                    background: order.status === 'delivered' ? 'rgba(34, 197, 94, 0.15)' : (order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)'),
                    color: order.status === 'delivered' ? '#22c55e' : (order.status === 'cancelled' ? '#ef4444' : '#eab308')
                  }}>
                    {order.status}
                  </span>
                  {order.trackingNumber && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Courier Tracking: <strong>{order.trackingNumber}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Placed On</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: '0.9rem' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* 2 to 4 Working Days Delivery Timeline Banner */}
            {!isCancelled && (
              <div style={{
                background: 'rgba(85, 198, 136, 0.08)',
                border: '1px solid rgba(85, 198, 136, 0.25)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(85, 198, 136, 0.15)', padding: '10px', borderRadius: '10px', color: '#55c688', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiTruck size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#55c688', fontWeight: 700 }}>
                      Delivery Guarantee: 2 to 4 Working Days (Max 4 Days)
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      All DrakeWears orders are processed and delivered within a strict 2-4 business day SLA.
                    </p>
                  </div>
                </div>
                {order.createdAt && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Arrival</span>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })} – {new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visual Tracking Steps */}
            {currentStep > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px', textAlign: 'center' }}>
                {[
                  { step: 1, label: 'Received', icon: <FiClock /> },
                  { step: 2, label: 'Processing', icon: <FiPackage /> },
                  { step: 3, label: 'Dispatched', icon: <FiTruck /> },
                  { step: 4, label: 'Delivered', icon: <FiCheckCircle /> }
                ].map((s) => (
                  <div key={s.step} style={{ opacity: currentStep >= s.step ? 1 : 0.35 }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: currentStep >= s.step ? 'var(--text-primary)' : 'var(--bg-secondary)',
                      color: currentStep >= s.step ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto 8px',
                      fontSize: '18px'
                    }}>
                      {s.icon}
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Order Items List */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Ordered Items ({order.itemsCount})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                  <img src={item.image || '/carousel-casualwears.jpg'} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.92rem' }}>{item.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Size: {item.size || 'Standard'} {item.color ? `• Color: ${item.color.name || item.color}` : ''} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Order Summary Footer */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Payment: <strong>{order.paymentMethod}</strong> • Destination: <strong>{order.shippingCity}</strong>
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                Total: Rs. {order.total?.toLocaleString()}
              </span>
            </div>

            {/* Customer Cancellation Controls */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px dashed var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Need to change or cancel this order?
                </span>
              </div>

              <div>
                {isCancellable && (
                  <button 
                    type="button" 
                    className="btn-customer-cancel"
                    onClick={handleOpenCancelModal}
                    id={`track-cancel-btn-${shortId}`}
                  >
                    <FiXCircle size={15} /> Cancel Order
                  </button>
                )}

                {isShippedOrDelivered && (
                  <a 
                    href={waSupportUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-customer-support-cancel"
                  >
                    <FiMessageCircle size={15} /> Contact Support to Cancel
                  </a>
                )}

                {isCancelled && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>
                    <FiXCircle size={14} /> Order Cancelled
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && order && (
          <div className="modal-overlay animate-fade-in" onClick={handleCloseCancelModal}>
            <div className="cancel-modal-content" onClick={e => e.stopPropagation()}>
              <div className="cancel-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="cancel-warning-icon">
                    <FiAlertCircle size={22} color="#e05555" />
                  </div>
                  <div>
                    <h3 className="cancel-modal-title">Cancel Order</h3>
                    <p className="cancel-modal-subtitle">Order #{shortId}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="modal-close-btn" 
                  onClick={handleCloseCancelModal}
                  disabled={submittingCancel}
                >
                  ✕
                </button>
              </div>

              <div className="cancel-modal-body">
                <div className="cancel-order-summary-box">
                  <div className="summary-row">
                    <span>Items Count:</span>
                    <strong>{order.itemsCount || order.items?.length || 0} product(s)</strong>
                  </div>
                  <div className="summary-row">
                    <span>Total Amount:</span>
                    <strong style={{ color: 'var(--gold)' }}>Rs. {order.total?.toLocaleString()}</strong>
                  </div>
                </div>

                {/* For guest orders without user session, require phone verification */}
                {!user && (
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="cancel-form-label" htmlFor="guest-verify-phone">
                      Registered Phone Number <span style={{ color: '#e05555' }}>*</span>
                    </label>
                    <input 
                      id="guest-verify-phone"
                      type="text"
                      className="cancel-select-input"
                      placeholder="e.g. 03001234567"
                      value={verificationPhone}
                      onChange={e => setVerificationPhone(e.target.value)}
                      disabled={submittingCancel}
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                      Required to verify ownership of this order.
                    </small>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="track-cancel-reason" className="cancel-form-label">
                    Reason for cancellation <span style={{ color: '#e05555' }}>*</span>
                  </label>
                  <select 
                    id="track-cancel-reason"
                    className="cancel-select-input"
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    disabled={submittingCancel}
                  >
                    {CANCEL_REASONS.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {cancelReason === 'Other' && (
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label htmlFor="track-cancel-other" className="cancel-form-label">
                      Please specify:
                    </label>
                    <textarea 
                      id="track-cancel-other"
                      rows={3}
                      className="cancel-textarea-input"
                      placeholder="Reason details..."
                      value={otherReasonText}
                      onChange={e => setOtherReasonText(e.target.value)}
                      disabled={submittingCancel}
                      maxLength={300}
                    />
                  </div>
                )}
              </div>

              <div className="cancel-modal-footer">
                <button 
                  type="button" 
                  className="btn-cancel-modal-secondary"
                  onClick={handleCloseCancelModal}
                  disabled={submittingCancel}
                >
                  Keep Order
                </button>
                <button 
                  type="button" 
                  className="btn-cancel-modal-danger"
                  onClick={handleConfirmCancel}
                  disabled={submittingCancel}
                >
                  {submittingCancel ? (
                    <>
                      <FiLoader className="spin" size={16} /> Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel My Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
