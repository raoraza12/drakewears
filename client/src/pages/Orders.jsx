import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiClock, FiXCircle, FiAlertCircle, FiMessageCircle, FiCheckCircle, FiLoader, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const STATUS_COLORS = {
  pending: '#c9a84c',
  confirmed: '#4299e1',
  processing: '#9f7aea',
  shipped: '#38b2ac',
  delivered: '#55c688',
  cancelled: '#e05555'
};

const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered by mistake',
  'Found better price elsewhere',
  'Delivery taking too long',
  'Want to change shipping address or items',
  'Other'
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  useEffect(() => {
    if (!user) return;
    API.get('/orders/mine')
      .then(r => setOrders(r.data))
      .catch(err => {
        console.error('Failed to load orders:', err);
        toast.error('Failed to load order history');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleOpenCancelModal = (order) => {
    setCancellingOrder(order);
    setCancelReason(CANCEL_REASONS[0]);
    setOtherReasonText('');
  };

  const handleCloseCancelModal = () => {
    if (submittingCancel) return;
    setCancellingOrder(null);
    setOtherReasonText('');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    const finalReason = cancelReason === 'Other' 
      ? (otherReasonText.trim() || 'Other reason') 
      : cancelReason;

    const orderId = cancellingOrder.id || cancellingOrder._id;
    setSubmittingCancel(true);

    try {
      await API.patch(`/orders/${orderId}/cancel`, {
        reason: finalReason
      });

      toast.success('Your order has been cancelled.');

      // Update state locally
      setOrders(prev => prev.map(o => {
        const id = o.id || o._id;
        if (id === orderId) {
          return {
            ...o,
            status: 'cancelled',
            shippingAddress: {
              ...(o.shippingAddress || {}),
              cancellation: {
                cancelledBy: 'customer',
                reason: finalReason,
                cancelledAt: new Date().toISOString()
              }
            }
          };
        }
        return o;
      }));

      setCancellingOrder(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order. Please contact support.';
      toast.error(msg);
    } finally {
      setSubmittingCancel(false);
    }
  };

  if (!user) {
    return (
      <div className="page-wrapper empty-page">
        <p>Please <Link to="/login">login</Link> to view orders</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container orders-page">
        <h1 className="orders-title">My Orders</h1>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-page" style={{ paddingTop: 60 }}>
            <FiPackage size={56} />
            <h3>No orders yet</h3>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          orders.map(order => {
            const orderId = order.id || order._id;
            const orderNumDisplay = order.orderNumber ? `#${order.orderNumber}` : `#${(orderId || '').slice(-8).toUpperCase()}`;
            const shortId = (orderId || '').slice(-8).toUpperCase();
            const statusKey = (order.status || 'pending').toLowerCase();
            const isCancellable = ['pending', 'confirmed', 'processing'].includes(statusKey);
            const isShippedOrDelivered = ['shipped', 'delivered'].includes(statusKey);
            const isCancelled = statusKey === 'cancelled';
            const cancellationInfo = order.shippingAddress?.cancellation;

            const waSupportUrl = `https://wa.me/923218254922?text=Hello%20DRAKEWEARS,%20I%20would%20like%20to%20request%20cancellation%20assistance%20for%20my%20order%20${encodeURIComponent(orderNumDisplay)}.`;

            return (
              <div key={orderId} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id">Order {orderNumDisplay}</span>
                    <span className="order-date">
                      <FiClock size={12} /> {new Date(order.createdAt).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}
                    </span>
                    {!isCancelled && statusKey !== 'delivered' && (
                      <div style={{ marginTop: '5px' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '0.76rem', 
                          fontWeight: 600, 
                          color: '#55c688', 
                          background: 'rgba(85, 198, 136, 0.12)', 
                          padding: '3px 9px', 
                          borderRadius: '20px',
                          border: '1px solid rgba(85, 198, 136, 0.25)' 
                        }}>
                          <FiTruck size={12} /> Delivery: 2 to 4 Working Days (Max 4 Days)
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="order-right">
                    <span 
                      className="order-status" 
                      style={{ 
                        background: (STATUS_COLORS[statusKey] || '#ccc') + '22', 
                        color: STATUS_COLORS[statusKey] || '#ccc', 
                        borderColor: (STATUS_COLORS[statusKey] || '#ccc') + '44' 
                      }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="order-total">Rs. {order.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="order-items-preview">
                  {order.items.map((item, i) => (
                    <div key={i} className="order-item-preview">
                      <div className="order-item-img">
                        {item.image && <img src={item.image} alt={item.name} />}
                        {!item.image && <div className="order-img-placeholder"><FiPackage size={20} /></div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-meta">
                          Qty: {item.quantity}{item.size && ` · Size: ${item.size}`}{item.color && ` · Color: ${typeof item.color === 'object' ? item.color.name : item.color}`}
                        </p>
                      </div>
                      <span className="order-item-price">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Status Bar / Actions Footer */}
                <div className="order-card-footer">
                  <div className="order-footer-details">
                    <span className="order-payment">{order.paymentMethod} · {order.paymentStatus}</span>
                    {order.shippingAddress?.city && (
                      <span className="order-ship-to">Ships to: {order.shippingAddress.city}, {order.shippingAddress.country || 'Pakistan'}</span>
                    )}
                  </div>

                  <div className="order-actions-container">
                    {/* 1. Cancellable orders: Show Cancel Button */}
                    {isCancellable && (
                      <button 
                        type="button" 
                        className="btn-customer-cancel"
                        onClick={() => handleOpenCancelModal(order)}
                        id={`cancel-btn-${shortId}`}
                      >
                        <FiXCircle size={14} /> Cancel Order
                      </button>
                    )}

                    {/* 2. Shipped / Delivered orders: Contact Support */}
                    {isShippedOrDelivered && (
                      <a 
                        href={waSupportUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-customer-support-cancel"
                        title="Contact support on WhatsApp to request cancellation or return"
                      >
                        <FiMessageCircle size={14} /> Contact Support to Cancel
                      </a>
                    )}

                    {/* 3. Already Cancelled: Clear Badge */}
                    {isCancelled && (
                      <div className="cancelled-badge-group">
                        <span className="order-cancelled-badge">
                          <FiXCircle size={13} /> Order Cancelled
                        </span>
                        {cancellationInfo?.reason && (
                          <span className="cancelled-reason-text">
                            Reason: {cancellationInfo.reason}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Cancellation Confirmation Modal */}
        {cancellingOrder && (
          <div className="modal-overlay animate-fade-in" onClick={handleCloseCancelModal}>
            <div className="cancel-modal-content" onClick={e => e.stopPropagation()}>
              <div className="cancel-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="cancel-warning-icon">
                    <FiAlertCircle size={22} color="#e05555" />
                  </div>
                  <div>
                    <h3 className="cancel-modal-title">Cancel Order</h3>
                    <p className="cancel-modal-subtitle">
                      Order {cancellingOrder.orderNumber ? `#${cancellingOrder.orderNumber}` : `#${(cancellingOrder.id || cancellingOrder._id || '').slice(-8).toUpperCase()}`}
                    </p>
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
                {/* Order Quick Summary */}
                <div className="cancel-order-summary-box">
                  <div className="summary-row">
                    <span>Items Count:</span>
                    <strong>{cancellingOrder.items?.length || 0} product(s)</strong>
                  </div>
                  <div className="summary-row">
                    <span>Order Total:</span>
                    <strong style={{ color: 'var(--gold)' }}>Rs. {cancellingOrder.total?.toLocaleString()}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Payment:</span>
                    <span>{cancellingOrder.paymentMethod} ({cancellingOrder.paymentStatus})</span>
                  </div>
                </div>

                <div className="cancel-alert-box">
                  <FiAlertCircle size={16} />
                  <span>
                    Cancelling this order will release all items back to inventory. If you already paid online, our team will process your refund according to store policy.
                  </span>
                </div>

                {/* Reason Selection */}
                <div className="form-group" style={{ marginTop: '18px' }}>
                  <label htmlFor="cancel-reason-select" className="cancel-form-label">
                    Please select a reason for cancellation <span style={{ color: '#e05555' }}>*</span>
                  </label>
                  <select 
                    id="cancel-reason-select"
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

                {/* Conditional Text Field for 'Other' */}
                {cancelReason === 'Other' && (
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label htmlFor="cancel-other-reason" className="cancel-form-label">
                      Tell us more about why you're cancelling:
                    </label>
                    <textarea 
                      id="cancel-other-reason"
                      rows={3}
                      className="cancel-textarea-input"
                      placeholder="Please provide details..."
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
                  Nevermind, Keep Order
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
