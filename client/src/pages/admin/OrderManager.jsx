import React, { useState, useEffect, useMemo } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { 
  FiCheckCircle, 
  FiClock, 
  FiTruck, 
  FiPackage, 
  FiXCircle, 
  FiPrinter, 
  FiSearch, 
  FiRefreshCw, 
  FiMessageCircle, 
  FiPhone, 
  FiChevronDown, 
  FiChevronUp,
  FiAlertTriangle,
  FiTrash2
} from 'react-icons/fi';
import './OrderManager.css';

const STATUS_CONFIG = {
  pending: { label: 'Pending Approval', color: '#e6a23c', bg: 'rgba(230, 162, 60, 0.15)' },
  processing: { label: 'Approved / Processing', color: '#9f7aea', bg: 'rgba(159, 122, 234, 0.15)' },
  confirmed: { label: 'Confirmed', color: '#4299e1', bg: 'rgba(66, 153, 225, 0.15)' },
  shipped: { label: 'Shipped', color: '#38b2ac', bg: 'rgba(56, 178, 172, 0.15)' },
  delivered: { label: 'Delivered', color: '#55c688', bg: 'rgba(85, 198, 136, 0.15)' },
  cancelled: { label: 'Cancelled', color: '#e05555', bg: 'rgba(224, 85, 85, 0.15)' },
};

const cleanPhone = (p) => {
  if (!p) return '';
  let clean = p.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '92' + clean.slice(1);
  return clean;
};

// Safe total computation if order record has 0 total
const getOrderTotal = (order) => {
  if (Number(order.total) > 0) return Number(order.total);
  if (order.items && order.items.length > 0) {
    const sub = order.items.reduce((sum, it) => sum + ((Number(it.price) || 0) * (Number(it.quantity) || 1)), 0);
    return Math.max(0, sub + (Number(order.shippingFee) || 0) - (Number(order.discount) || 0));
  }
  return 0;
};

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/orders');
      // Filter out WhatsApp orders to keep this for Web Orders only
      const webOrders = res.data.filter(o => o.paymentMethod !== 'WhatsApp' && !(o.notes && o.notes.includes('[WHATSAPP_ORDER]')));
      setOrders(webOrders);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (id) => {
    try {
      await API.put(`/admin/orders/${id}`, { status: 'processing' });
      toast.success('Order Approved & moved to Processing! ✨');
      setOrders(orders.map(o => (o.id === id || o._id === id) ? { ...o, status: 'processing' } : o));
    } catch (err) {
      toast.error('Failed to approve order');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.put(`/admin/orders/${id}`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      setOrders(orders.map(o => (o.id === id || o._id === id) ? { ...o, status: newStatus } : o));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await API.put(`/admin/orders/${id}`, { status: 'cancelled' });
      toast.success('Order marked as cancelled');
      setOrders(orders.map(o => (o.id === id || o._id === id) ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  const handleMarkRefunded = async (id) => {
    if (!window.confirm('Confirm that this online payment refund has been processed back to customer?')) return;
    try {
      await API.put(`/admin/orders/${id}`, { paymentStatus: 'refunded' });
      toast.success('Order payment status marked as Refunded! ✨');
      setOrders(orders.map(o => (o.id === id || o._id === id) ? { ...o, paymentStatus: 'refunded' } : o));
    } catch (err) {
      toast.error('Failed to update refund status');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this order record? This cannot be undone.')) return;
    try {
      await API.delete(`/admin/orders/${id}`);
      toast.success('Order permanently deleted');
      setOrders(orders.filter(o => (o.id !== id && o._id !== id)));
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Stats computation
  const stats = useMemo(() => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const revenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + getOrderTotal(o), 0);
    return { pending, processing, shipped, delivered, revenue, total: orders.length };
  }, [orders]);

  // Filter & Search logic
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Tab filter
      if (activeFilter === 'pending' && o.status !== 'pending') return false;
      if (activeFilter === 'processing' && o.status !== 'processing' && o.status !== 'confirmed') return false;
      if (activeFilter === 'shipped' && o.status !== 'shipped') return false;
      if (activeFilter === 'delivered' && o.status !== 'delivered') return false;
      if (activeFilter === 'cancelled' && o.status !== 'cancelled') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idStr = String(o.id || o._id || '').toLowerCase();
        const nameStr = String(o.shippingAddress?.name || o.user?.name || '').toLowerCase();
        const phoneStr = String(o.shippingAddress?.phone || o.user?.phone || '').toLowerCase();
        const cityStr = String(o.shippingAddress?.city || '').toLowerCase();
        const emailStr = String(o.shippingAddress?.email || o.user?.email || '').toLowerCase();
        return idStr.includes(q) || nameStr.includes(q) || phoneStr.includes(q) || cityStr.includes(q) || emailStr.includes(q);
      }
      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  return (
    <div className="order-manager-wrapper animate-fade-in">
      {/* Header */}
      <div className="panel-header" style={{ padding: '0 0 16px 0', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="h2">Orders Management</h1>
          <p className="text-body" style={{ marginTop: '4px' }}>
            Review, approve, track, and dispatch website orders.
          </p>
        </div>
        <button className="btn-refresh" onClick={fetchOrders} title="Refresh Orders List">
          <FiRefreshCw /> Refresh Orders
        </button>
      </div>

      {/* Top Quick Stats Bar */}
      <div className="orders-stats-bar">
        <div className={`order-stat-pill ${stats.pending > 0 ? 'pill-pending' : ''}`} onClick={() => setActiveFilter('pending')}>
          <span className="label">Needs Approval</span>
          <span className="value">{stats.pending}</span>
        </div>
        <div className="order-stat-pill pill-processing" onClick={() => setActiveFilter('processing')}>
          <span className="label">Processing</span>
          <span className="value">{stats.processing}</span>
        </div>
        <div className="order-stat-pill" onClick={() => setActiveFilter('shipped')}>
          <span className="label">Shipped</span>
          <span className="value">{stats.shipped}</span>
        </div>
        <div className="order-stat-pill" onClick={() => setActiveFilter('delivered')}>
          <span className="label">Delivered</span>
          <span className="value">{stats.delivered}</span>
        </div>
        <div className="order-stat-pill pill-revenue" onClick={() => setActiveFilter('all')}>
          <span className="label">Total Revenue</span>
          <span className="value">Rs. {stats.revenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="orders-filter-bar">
        <div className="status-tabs">
          <button 
            type="button"
            className={`status-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All <span className="tab-badge">{orders.length}</span>
          </button>
          <button 
            type="button"
            className={`status-tab-btn ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
            style={stats.pending > 0 && activeFilter !== 'pending' ? { color: '#e6a23c', borderColor: 'rgba(230, 162, 60, 0.4)' } : {}}
          >
            Pending <span className="tab-badge">{stats.pending}</span>
          </button>
          <button 
            type="button"
            className={`status-tab-btn ${activeFilter === 'processing' ? 'active' : ''}`}
            onClick={() => setActiveFilter('processing')}
          >
            Processing <span className="tab-badge">{stats.processing}</span>
          </button>
          <button 
            type="button"
            className={`status-tab-btn ${activeFilter === 'shipped' ? 'active' : ''}`}
            onClick={() => setActiveFilter('shipped')}
          >
            Shipped <span className="tab-badge">{stats.shipped}</span>
          </button>
          <button 
            type="button"
            className={`status-tab-btn ${activeFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setActiveFilter('delivered')}
          >
            Delivered <span className="tab-badge">{stats.delivered}</span>
          </button>
          <button 
            type="button"
            className={`status-tab-btn ${activeFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <div className="orders-search-box">
          <FiSearch color="#888" size={16} />
          <input 
            type="text" 
            placeholder="Search Order ID, Name, Phone..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="admin-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <FiPackage size={48} color="#666" style={{ marginBottom: '16px' }} />
          <h3>No matching orders found</h3>
          <p className="text-secondary" style={{ marginTop: '8px' }}>
            {searchQuery ? `No orders matched "${searchQuery}"` : `No orders in "${activeFilter}" status.`}
          </p>
          {(searchQuery || activeFilter !== 'all') && (
            <button 
              className="btn-ghost" 
              style={{ marginTop: '16px' }}
              onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* =========================================================
              1. DESKTOP TABLE VIEW (Visible on Screens > 920px)
              ========================================================= */}
          <div className="admin-panel desktop-orders-table">
            <div className="panel-body" style={{ padding: '0', overflowX: 'auto' }}>
              <table className="admin-table" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ paddingLeft: '20px' }}>Order ID</th>
                    <th>Customer</th>
                    <th>Contact & WhatsApp</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th style={{ paddingRight: '20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const orderId = order.id || order._id;
                    const isExpanded = expandedOrder === orderId;
                    const phone = order.shippingAddress?.phone || 'N/A';
                    const customerName = order.shippingAddress?.name || 'Customer';
                    const email = order.shippingAddress?.email || (order.user?.email && !order.user.email.startsWith('guest_') ? order.user.email : '');
                    const isRegisteredUser = Boolean(order.user?.email && !order.user.email.startsWith('guest_'));
                    const statusInfo = STATUS_CONFIG[order.status] || { label: order.status, color: '#ccc', bg: 'rgba(255,255,255,0.1)' };

                    // Cancellation & Refund Metadata
                    const cancellation = order.shippingAddress?.cancellation;
                    const isCustomerCancel = order.status === 'cancelled' && (
                      cancellation?.cancelledByType === 'customer' || 
                      cancellation?.cancelledByType === 'guest' || 
                      (order.notes && order.notes.includes('[CANCELLED BY'))
                    );
                    const cancelReasonText = cancellation?.reason || (order.notes && order.notes.match(/\[CANCELLED BY [^:]+:\s*([^\]]+)\]/)?.[1]);
                    const isRefundPending = order.paymentStatus === 'refund_pending';

                    const orderNumDisplay = order.orderNumber ? `#${order.orderNumber}` : `#${String(orderId).slice(-6).toUpperCase()}`;
                    const minDeliveryDate = new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
                    const maxDeliveryDate = new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
                    const waConfirmMsg = `Assalam-o-Alaikum ${customerName}! 🌟\n\nThis is DRAKEWEARS regarding your Order ${orderNumDisplay}.\n\n📦 *Order Summary:*\n- Total: Rs. ${getOrderTotal(order).toLocaleString()}\n- Payment: ${order.paymentMethod}\n- Shipping Address: ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}\n\n🚚 *Delivery Timeline:* 2 to 4 Working Days (Max 4 Days)\n📅 *Estimated Delivery:* ${minDeliveryDate} – ${maxDeliveryDate}\n\nPlease confirm if your delivery address is complete and correct. Thank you for choosing DRAKEWEARS!\nHelpline: +92 321 8254922`;

                    return (
                      <React.Fragment key={orderId}>
                        <tr 
                          style={{ cursor: 'pointer', transition: 'background 0.2s ease' }}
                          onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                        >
                          {/* Order ID */}
                          <td style={{ paddingLeft: '20px' }}>
                            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                              {orderNumDisplay}
                            </strong>
                            <br />
                            <small style={{ color: 'var(--gold)', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              {isExpanded ? <><FiChevronUp size={12} /> Less</> : <><FiChevronDown size={12} /> Details</>}
                            </small>
                          </td>

                          {/* Customer */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{customerName}</strong>
                              {isRegisteredUser ? (
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)', fontWeight: 600 }}>Member</span>
                              ) : (
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>Guest</span>
                              )}
                            </div>
                            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                              {order.shippingAddress?.city ? `${order.shippingAddress.city} · ` : ''}{order.paymentMethod}
                            </small>
                            {email && (
                              <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem', display: 'block' }}>{email}</small>
                            )}
                          </td>

                          {/* Contact with WhatsApp & Call */}
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{phone || 'N/A'}</div>
                            {phone && (
                              <div className="contact-actions">
                                <a 
                                  href={`https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(waConfirmMsg)}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="contact-pill wa"
                                  title="Chat on WhatsApp"
                                >
                                  <FiMessageCircle size={12} /> WhatsApp
                                </a>
                                <a href={`tel:${phone}`} className="contact-pill call" title="Call Customer">
                                  <FiPhone size={12} /> Call
                                </a>
                              </div>
                            )}
                          </td>

                          {/* Date */}
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                          </td>

                          {/* Total */}
                          <td>
                            <strong style={{ color: 'var(--gold)', fontSize: '0.95rem' }}>
                              Rs. {getOrderTotal(order).toLocaleString()}
                            </strong>
                          </td>

                          {/* Status Badge */}
                          <td>
                            {isCustomerCancel ? (
                              <div>
                                <span 
                                  className="status-badge"
                                  style={{ 
                                    background: 'rgba(239, 68, 68, 0.15)', 
                                    color: '#ff6b6b',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontWeight: 700
                                  }}
                                  title={`Order was cancelled directly by ${cancellation?.cancelledByType === 'guest' ? 'Guest Customer' : 'Customer'}`}
                                >
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff6b6b' }}></span>
                                  Cancelled by {cancellation?.cancelledByType === 'guest' ? 'Guest' : 'Customer'}
                                </span>
                                {cancelReasonText && (
                                  <div style={{ color: '#ffb3b3', fontSize: '0.72rem', marginTop: '3px', maxWidth: '170px', lineHeight: '1.25' }}>
                                    <em>"{cancelReasonText}"</em>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span 
                                  className="status-badge"
                                  style={{ 
                                    background: statusInfo.bg, 
                                    color: statusInfo.color,
                                    border: `1px solid ${statusInfo.color}44`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusInfo.color }}></span>
                                  {order.status === 'cancelled' ? 'Cancelled by Admin' : statusInfo.label}
                                </span>
                              </div>
                            )}

                            {isRefundPending && (
                              <div style={{ marginTop: '5px' }}>
                                <span 
                                  style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px', 
                                    padding: '2px 8px', 
                                    borderRadius: '12px', 
                                    fontSize: '0.68rem', 
                                    fontWeight: 700, 
                                    background: 'rgba(245, 158, 11, 0.18)', 
                                    color: '#f59e0b', 
                                    border: '1px solid rgba(245, 158, 11, 0.4)' 
                                  }}
                                >
                                  ⚠️ Refund Pending
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td style={{ paddingRight: '20px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                              
                              {/* Refund Action button if refund is pending */}
                              {isRefundPending && (
                                <button
                                  type="button"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '5px 9px',
                                    borderRadius: '6px',
                                    background: 'rgba(245, 158, 11, 0.15)',
                                    color: '#f59e0b',
                                    border: '1px solid rgba(245, 158, 11, 0.45)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => handleMarkRefunded(orderId)}
                                  title="Mark this customer's online refund as completed"
                                >
                                  Mark Refunded
                                </button>
                              )}

                              {/* Prominent APPROVE ORDER Button for Pending */}
                              {order.status === 'pending' && (
                                <button
                                  type="button"
                                  className="btn-approve"
                                  onClick={() => handleApproveOrder(orderId)}
                                  title="Approve Order & Move to Processing"
                                >
                                  <FiCheckCircle size={14} /> Approve Order
                                </button>
                              )}

                              {/* Quick Next Steps */}
                              {(order.status === 'processing' || order.status === 'confirmed') && (
                                <button
                                  type="button"
                                  className="btn-ship"
                                  onClick={() => handleUpdateStatus(orderId, 'shipped')}
                                  title="Mark as Shipped with Courier"
                                >
                                  <FiTruck size={14} /> Ship
                                </button>
                              )}

                              {order.status === 'shipped' && (
                                <button
                                  type="button"
                                  className="btn-deliver"
                                  onClick={() => handleUpdateStatus(orderId, 'delivered')}
                                  title="Mark as Delivered to Customer"
                                >
                                  <FiPackage size={14} /> Delivered
                                </button>
                              )}

                              {/* Status Dropdown */}
                              <select 
                                className="order-status-select" 
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(orderId, e.target.value)}
                              >
                                <option value="pending">Pending Approval</option>
                                <option value="processing">Approved / Processing</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              {/* Invoice Button */}
                              <button
                                type="button"
                                className="btn-invoice-act"
                                onClick={() => setInvoiceOrder(order)}
                                title="Print Packing Slip / Invoice"
                              >
                                <FiPrinter size={13} /> Invoice
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                className="btn-delete-act"
                                onClick={() => handleDeleteOrder(orderId)}
                                title="Delete Order Record"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Collapsible Items & Details */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="7" style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px 24px', borderBottom: '1px solid var(--border-medium)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                                <div>
                                  <h4 style={{ fontSize: '0.82rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.08em' }}>
                                    Ordered Items ({order.items?.length || 0})
                                  </h4>
                                  {order.items && order.items.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {order.items.map((item, idx) => (
                                        <div key={idx} style={{ fontSize: '0.84rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                                          <div>
                                            <strong>{item.quantity}x</strong> {item.name}
                                            {item.size && <span style={{ color: 'var(--text-secondary)' }}> · Size: {item.size}</span>}
                                            {item.color && <span style={{ color: 'var(--text-secondary)' }}> · Color: {item.color}</span>}
                                          </div>
                                          <span style={{ fontWeight: 600 }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No item details recorded</p>
                                  )}
                                </div>
                                <div>
                                  <h4 style={{ fontSize: '0.82rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.08em' }}>
                                    Shipping & Dispatch Information
                                  </h4>
                                  <div style={{ fontSize: '0.84rem', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                                    <p style={{ margin: 0 }}><strong>Recipient:</strong> {customerName}</p>
                                    <p style={{ margin: 0 }}><strong>Phone:</strong> {phone || 'N/A'}</p>
                                    {email && <p style={{ margin: 0 }}><strong>Email:</strong> {email}</p>}
                                    <p style={{ margin: 0 }}>
                                      <strong>Address:</strong> {order.shippingAddress?.street || 'N/A'}, {order.shippingAddress?.city || ''} {order.shippingAddress?.state || ''} {order.shippingAddress?.zip ? `(${order.shippingAddress.zip})` : ''}
                                    </p>
                                    <p style={{ margin: 0, marginTop: '4px', color: 'var(--text-secondary)' }}>
                                      <strong>Account Type:</strong> {isRegisteredUser ? `Registered Member (${order.user?.name || order.user?.email || 'User'})` : 'Guest Checkout'}
                                    </p>
                                    <p style={{ margin: 0, marginTop: '2px', color: 'var(--text-secondary)' }}>
                                      <strong>Payment Method:</strong> {order.paymentMethod}
                                    </p>

                                    {/* Cancellation Details Box if Cancelled */}
                                    {order.status === 'cancelled' && (
                                      <div style={{ marginTop: '10px', padding: '10px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                        <div style={{ color: '#ff6b6b', fontWeight: 700, fontSize: '0.78rem' }}>
                                          {isCustomerCancel ? `DIRECT CANCELLATION BY ${cancellation?.cancelledByType === 'guest' ? 'GUEST' : 'CUSTOMER'}` : 'CANCELLED BY ADMIN'}
                                        </div>
                                        {cancelReasonText && (
                                          <div style={{ color: '#fff', fontSize: '0.8rem', marginTop: '3px' }}>
                                            <strong>Reason:</strong> {cancelReasonText}
                                          </div>
                                        )}
                                        {cancellation?.cancelledAt && (
                                          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>
                                            Cancelled at: {new Date(cancellation.cancelledAt).toLocaleString('en-PK')}
                                          </div>
                                        )}
                                        <div style={{ color: '#55c688', fontSize: '0.72rem', marginTop: '3px' }}>
                                          ✓ Inventory stock auto-restored
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================
              2. MOBILE / TABLET ORDER CARDS VIEW (<= 920px)
              ========================================================= */}
          <div className="mobile-orders-view">
            {filteredOrders.map(order => {
              const orderId = order.id || order._id;
              const phone = order.shippingAddress?.phone || 'N/A';
              const customerName = order.shippingAddress?.name || 'Customer';
              const email = order.shippingAddress?.email || (order.user?.email && !order.user.email.startsWith('guest_') ? order.user.email : '');
              const isRegisteredUser = Boolean(order.user?.email && !order.user.email.startsWith('guest_'));
              const statusInfo = STATUS_CONFIG[order.status] || { label: order.status, color: '#ccc', bg: 'rgba(255,255,255,0.1)' };
              const isPending = order.status === 'pending';

              const cancellation = order.shippingAddress?.cancellation;
              const isCustomerCancel = order.status === 'cancelled' && (
                cancellation?.cancelledByType === 'customer' || 
                cancellation?.cancelledByType === 'guest' || 
                (order.notes && order.notes.includes('[CANCELLED BY'))
              );
              const cancelReasonText = cancellation?.reason || (order.notes && order.notes.match(/\[CANCELLED BY [^:]+:\s*([^\]]+)\]/)?.[1]);
              const isRefundPending = order.paymentStatus === 'refund_pending';

              const orderNumDisplay = order.orderNumber ? `#${order.orderNumber}` : `#${String(orderId).slice(-6).toUpperCase()}`;
              const minDeliveryDate = new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
              const maxDeliveryDate = new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
              const waConfirmMsg = `Assalam-o-Alaikum ${customerName}! 🌟\n\nThis is DRAKEWEARS regarding your Order ${orderNumDisplay}.\n\n📦 *Order Summary:*\n- Total: Rs. ${getOrderTotal(order).toLocaleString()}\n- Payment: ${order.paymentMethod}\n- Shipping Address: ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}\n\n🚚 *Delivery Timeline:* 2 to 4 Working Days (Max 4 Days)\n📅 *Estimated Delivery:* ${minDeliveryDate} – ${maxDeliveryDate}\n\nPlease confirm if your delivery address is complete and correct. Thank you for choosing DRAKEWEARS!\nHelpline: +92 321 8254922`;

              return (
                <div 
                  key={orderId} 
                  className={`mobile-order-card ${isPending ? 'pending-border' : order.status === 'processing' ? 'processing-border' : order.status === 'delivered' ? 'delivered-border' : ''}`}
                >
                  {/* Card Top: ID, Date, Status */}
                  <div className="mobile-card-top">
                    <div>
                      <div className="mobile-card-id">
                        {orderNumDisplay}
                      </div>
                      <div className="mobile-card-date">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {isCustomerCancel ? (
                        <span 
                          className="status-badge"
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.15)', 
                            color: '#ff6b6b', 
                            border: '1px solid rgba(239, 68, 68, 0.35)', 
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}
                        >
                          Cancelled by {cancellation?.cancelledByType === 'guest' ? 'Guest' : 'Customer'}
                        </span>
                      ) : (
                        <span 
                          className="status-badge"
                          style={{ 
                            background: statusInfo.bg, 
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.color}44`,
                            fontSize: '0.75rem'
                          }}
                        >
                          {order.status === 'cancelled' ? 'Cancelled by Admin' : statusInfo.label}
                        </span>
                      )}

                      {isRefundPending && (
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                            ⚠️ Refund Pending
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Cancellation Reason Note on Mobile */}
                  {isCustomerCancel && cancelReasonText && (
                    <div style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '6px', margin: '4px 0 10px', fontSize: '0.76rem', color: '#ffb3b3' }}>
                      <strong>Cancellation Reason:</strong> {cancelReasonText}
                    </div>
                  )}

                  {/* Customer Information */}
                  <div className="mobile-customer-section">
                    <div className="mobile-customer-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {customerName}
                      {isRegisteredUser ? (
                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)', fontWeight: 600 }}>Member</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>Guest</span>
                      )}
                    </div>
                    {email && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '1px' }}>{email}</div>
                    )}
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                      {order.shippingAddress?.street ? `${order.shippingAddress.street}, ` : ''}{order.shippingAddress?.city || ''}
                    </div>
                    {phone && (
                      <div className="contact-actions" style={{ marginTop: '6px' }}>
                        <a 
                          href={`https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(waConfirmMsg)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="contact-pill wa"
                        >
                          <FiMessageCircle size={12} /> WhatsApp Confirm
                        </a>
                        <a href={`tel:${phone}`} className="contact-pill call">
                          <FiPhone size={12} /> {phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Items Summary */}
                  <div className="mobile-items-summary">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="mobile-item-line">
                        <div>
                          <strong>{item.quantity}x</strong> {item.name}
                          {item.size && <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}> ({item.size})</span>}
                          {item.color && <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}> ({item.color})</span>}
                        </div>
                        <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total & Payment Mode */}
                  <div className="mobile-card-footer">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Payment: <strong>{order.paymentMethod}</strong>
                    </span>
                    <div className="mobile-card-total">
                      Rs. {getOrderTotal(order).toLocaleString()}
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="mobile-card-actions">
                    {/* Big APPROVE Button if Pending */}
                    {isPending && (
                      <button
                        type="button"
                        className="btn-approve"
                        style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
                        onClick={() => handleApproveOrder(orderId)}
                      >
                        <FiCheckCircle size={18} /> Approve Order Now
                      </button>
                    )}

                    <div className="mobile-action-buttons">
                      {/* Mark Refunded Button for Mobile */}
                      {isRefundPending && (
                        <button
                          type="button"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.5)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleMarkRefunded(orderId)}
                          title="Mark this customer's online refund as completed"
                        >
                          ✓ Mark Refunded
                        </button>
                      )}

                      {/* Status Selector */}
                      <select 
                        className="order-status-select" 
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(orderId, e.target.value)}
                      >
                        <option value="pending">Pending Approval</option>
                        <option value="processing">Approved / Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      {/* Invoice Button */}
                      <button
                        type="button"
                        className="btn-invoice-act"
                        onClick={() => setInvoiceOrder(order)}
                      >
                        <FiPrinter size={14} /> Invoice
                      </button>

                      {/* Quick Reject button if pending */}
                      {isPending && (
                        <button
                          type="button"
                          className="btn-cancel-action"
                          onClick={() => handleCancelOrder(orderId)}
                          title="Reject Order"
                        >
                          <FiXCircle size={14} /> Reject
                        </button>
                      )}

                      {/* Delete button */}
                      <button
                        type="button"
                        className="btn-delete-act"
                        onClick={() => handleDeleteOrder(orderId)}
                        title="Delete Order Record"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Invoice Modal (Mobile Responsive) */}
      {invoiceOrder && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setInvoiceOrder(null)}
        >
          <div 
            id="printable-invoice"
            style={{
              backgroundColor: '#fff',
              color: '#111',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: '12px',
              padding: 'clamp(16px, 4vw, 36px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Action Bar (hidden in print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '14px' }}>
              <button 
                onClick={handlePrint} 
                style={{ background: '#0f1a18', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
              >
                🖨️ Print Packing Slip / Invoice
              </button>
              <button 
                onClick={() => setInvoiceOrder(null)} 
                style={{ background: '#e05555', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                ✕ Close
              </button>
            </div>

            {/* Printable Content */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #111', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.6rem', letterSpacing: '2px', fontWeight: 800 }}>DRAKEWEARS</h1>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>Official Streetwear & Luxe Essentials</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#666' }}>All-Pakistan Express Delivery</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#111' }}>INVOICE</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 700 }}>{invoiceOrder.orderNumber ? `Order #${invoiceOrder.orderNumber}` : `#${String(invoiceOrder.id || invoiceOrder._id).toUpperCase()}`}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#666' }}>Date: {new Date(invoiceOrder.createdAt).toLocaleDateString('en-GB')}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#27ae60', fontWeight: 600 }}>Delivery: 2-4 Working Days</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', fontSize: '0.85rem', lineHeight: '1.5' }}>
              <div>
                <strong style={{ color: '#444', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Ship To:</strong>
                <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{invoiceOrder.shippingAddress?.name || 'Customer'}</p>
                <p style={{ margin: '2px 0 0' }}>{invoiceOrder.shippingAddress?.phone || 'N/A'}</p>
                {invoiceOrder.shippingAddress?.email && (
                  <p style={{ margin: '2px 0 0', color: '#555', fontSize: '0.78rem' }}>{invoiceOrder.shippingAddress.email}</p>
                )}
                <p style={{ margin: '2px 0 0', color: '#444' }}>
                  {invoiceOrder.shippingAddress?.street}<br />
                  {invoiceOrder.shippingAddress?.city}, {invoiceOrder.shippingAddress?.state} {invoiceOrder.shippingAddress?.zip}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: '#444', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Order Details:</strong>
                <p style={{ margin: '4px 0 0' }}><strong>Payment:</strong> {invoiceOrder.paymentMethod}</p>
                <p style={{ margin: '2px 0 0' }}><strong>Payment Status:</strong> {invoiceOrder.isPaid ? 'PAID' : 'Cash On Delivery (COD)'}</p>
                <p style={{ margin: '2px 0 0' }}><strong>Order Status:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{invoiceOrder.status}</span></p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.85rem', minWidth: '400px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #111', background: '#f5f5f5', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Item Description</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Size</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceOrder.items?.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <strong>{item.name}</strong>
                        {item.color && <div style={{ fontSize: '0.75rem', color: '#666' }}>Color: {item.color}</div>}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.size || '-'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>Rs. {Number(item.price).toLocaleString()}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>Rs. {(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <div style={{ width: '240px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Subtotal:</span>
                  <span>Rs. {(invoiceOrder.items?.reduce((s, it) => s + (it.price * it.quantity), 0) || 0).toLocaleString()}</span>
                </div>
                {invoiceOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#27ae60' }}>
                    <span>Coupon Discount:</span>
                    <span>-Rs. {Number(invoiceOrder.discount).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Shipping:</span>
                  <span>Rs. {Number(invoiceOrder.shippingPrice || 150).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #111', fontWeight: 800, fontSize: '1rem', marginTop: '4px' }}>
                  <span>Grand Total:</span>
                  <span>Rs. {Number(invoiceOrder.total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #ccc', paddingTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#666' }}>
              <p style={{ margin: 0 }}>Thank you for shopping with DRAKEWEARS. For exchanges and queries, WhatsApp: +92 321 8254922</p>
              <p style={{ margin: '4px 0 0' }}>Streetwear Crafted for the Bold • www.drakewears.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
