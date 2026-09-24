import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiPlus, FiCheckCircle, FiTruck, FiPackage } from 'react-icons/fi';
import API from '../../api';
import toast from 'react-hot-toast';
import './OrderManager.css';

const WhatsappOrders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    phoneNumber: '',
    productId: '',
    price: '',
    size: 'M',
    color: 'Black'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        API.get('/admin/orders'),
        API.get('/products') // Assuming this is public or accessible
      ]);
      const waOrders = ordersRes.data.filter(o => o.paymentMethod === 'WhatsApp' || (o.notes && o.notes.includes('[WHATSAPP_ORDER]')));
      setOrders(waOrders);
      setProducts(productsRes.data.products || productsRes.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!form.productId) return toast.error('Please select a product');
    
    const selectedProduct = products.find(p => p.id === form.productId || p._id === form.productId);
    
    try {
      await API.post('/admin/orders/whatsapp', {
        ...form,
        productName: selectedProduct.name,
      });
      toast.success('WhatsApp Order Logged!');
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating order');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.put(`/admin/orders/${id}`, { status: newStatus });
      toast.success('Status updated');
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const [expandedOrder, setExpandedOrder] = useState(null);

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="panel-header" style={{ padding: '0 0 24px 0', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="h2" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiMessageCircle color="#25D366" /> WhatsApp Orders
          </h1>
          <p className="text-body" style={{ marginTop: '8px' }}>Manage and log orders received directly via WhatsApp here.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <FiPlus /> Log New WA Order
        </button>
      </div>

      {showForm && (
        <div className="admin-panel" style={{ marginBottom: '24px' }}>
          <form className="panel-body" onSubmit={handleCreateOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label className="form-label">Customer Name</label>
              <input required className="form-input" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} placeholder="Ali Khan" />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input required className="form-input" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="0300-1234567" />
            </div>
            <div>
              <label className="form-label">Product</label>
              <select required className="form-input" value={form.productId} onChange={e => {
                const prod = products.find(p => p.id === e.target.value || p._id === e.target.value);
                setForm({...form, productId: e.target.value, price: prod ? prod.price : ''});
              }}>
                <option value="">Select Product...</option>
                {products.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>{p.name} - Rs. {p.price}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Agreed Price (Rs)</label>
              <input required type="number" className="form-input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            </div>
            <div>
              <label className="form-label">Size</label>
              <select className="form-input" value={form.size} onChange={e => setForm({...form, size: e.target.value})}>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            <div>
              <label className="form-label">Color</label>
              <input className="form-input" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="Black, Navy, etc." />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-primary" style={{ padding: '12px 24px', width: '100%', maxWidth: '240px' }}>Save Order</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-panel">
        <div className="panel-body" style={{ padding: '16px' }}>
          {loading ? <p>Loading...</p> : (
            <>
              {/* Desktop Table View */}
              <div className="table-responsive desktop-orders-table">
                <table className="admin-table" style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Total (Rs)</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No WhatsApp orders found</td></tr>
                  ) : orders.map(order => {
                    const isExpanded = expandedOrder === (order.id || order._id);
                    return (
                      <React.Fragment key={order.id || order._id}>
                        <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedOrder(isExpanded ? null : (order.id || order._id))}>
                          <td>
                            <strong>{order.orderNumber ? `#${order.orderNumber}` : `#${String(order.id || order._id).slice(-6).toUpperCase()}`}</strong>
                            <br />
                            <small style={{ color: 'var(--gold)', fontSize: '0.72rem' }}>{isExpanded ? '▲ Close Items' : '▼ View Items'}</small>
                          </td>
                          <td>{order.shippingAddress?.name || order.user?.name || 'WhatsApp Customer'}</td>
                          <td>{order.shippingAddress?.phone || (order.notes && order.notes.split('Phone: ')[1]) || order.user?.phone || 'N/A'}</td>
                          <td><strong>Rs. {order.total.toLocaleString()}</strong></td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge status-${order.status === 'delivered' ? 'completed' : order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {order.status === 'pending' && (
                                <button 
                                  type="button"
                                  className="btn-approve" 
                                  onClick={() => handleUpdateStatus(order.id || order._id, 'processing')}
                                >
                                  <FiCheckCircle size={13} /> Approve
                                </button>
                              )}
                              {order.status === 'processing' && (
                                <button 
                                  type="button"
                                  className="btn-ship" 
                                  onClick={() => handleUpdateStatus(order.id || order._id, 'shipped')}
                                >
                                  <FiTruck size={13} /> Ship
                                </button>
                              )}
                              {order.status === 'shipped' && (
                                <button 
                                  type="button"
                                  className="btn-deliver" 
                                  onClick={() => handleUpdateStatus(order.id || order._id, 'delivered')}
                                >
                                  <FiPackage size={13} /> Delivered
                                </button>
                              )}
                              <select 
                                className="form-input" 
                                style={{ padding: '5px 8px', fontSize: '0.78rem', width: 'auto', background: '#1c1c22' }}
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(order.id || order._id, e.target.value)}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan="7" style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px 24px' }}>
                              <h4 style={{ fontSize: '0.85rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px' }}>Ordered Items</h4>
                              {order.items && order.items.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {order.items.map((item, idx) => (
                                    <div key={idx} style={{ fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
                                      <span>
                                        <strong>{item.quantity}x</strong> {item.name}
                                        {item.size && <span style={{ color: 'var(--text-secondary)' }}> (Size: {item.size})</span>}
                                        {item.color && <span style={{ color: 'var(--text-secondary)' }}> ({item.color})</span>}
                                      </span>
                                      <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{order.notes || 'No item details recorded'}</p>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              </div>

              {/* Mobile Orders Card View (Visible only on mobile <= 920px) */}
              <div className="mobile-orders-view" style={{ display: 'none', flexDirection: 'column', gap: '14px' }}>
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No WhatsApp orders found</div>
                ) : orders.map(order => {
                  const phoneClean = (order.shippingAddress?.phone || (order.notes && order.notes.split('Phone: ')[1]) || order.user?.phone || '').replace(/[^0-9]/g, '');
                  return (
                    <div key={order.id || order._id} className="mobile-order-card" style={{ background: '#15151a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#fff' }}>
                            {order.orderNumber ? `#${order.orderNumber}` : `#${String(order.id || order._id).slice(-6).toUpperCase()}`}
                          </strong>
                          <div style={{ fontSize: '0.72rem', color: '#888', marginTop: '2px' }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`status-badge status-${order.status === 'delivered' ? 'completed' : order.status}`}>
                          {order.status}
                        </span>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>
                          {order.shippingAddress?.name || order.user?.name || 'WhatsApp Customer'}
                        </div>
                        {phoneClean && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.82rem', color: '#aaa' }}>{order.shippingAddress?.phone || (order.notes && order.notes.split('Phone: ')[1]) || order.user?.phone}</span>
                            <a 
                              href={`https://wa.me/${phoneClean.startsWith('0') ? '92' + phoneClean.slice(1) : phoneClean}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
                            >
                              <FiMessageCircle size={12} /> WhatsApp
                            </a>
                          </div>
                        )}
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ddd' }}>
                              <span>{item.quantity}x {item.name} {item.size && `(${item.size})`} {item.color && `(${item.color})`}</span>
                              <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Total Amount:</span>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--gold, #c9a84c)' }}>Rs. {order.total.toLocaleString()}</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                        {order.status === 'pending' && (
                          <button 
                            type="button"
                            className="btn-approve" 
                            style={{ flex: 1, padding: '8px', minHeight: '38px', fontSize: '0.8rem' }}
                            onClick={() => handleUpdateStatus(order.id || order._id, 'processing')}
                          >
                            <FiCheckCircle size={13} /> Approve
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button 
                            type="button"
                            className="btn-ship" 
                            style={{ flex: 1, padding: '8px', minHeight: '38px', fontSize: '0.8rem' }}
                            onClick={() => handleUpdateStatus(order.id || order._id, 'shipped')}
                          >
                            <FiTruck size={13} /> Ship
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button 
                            type="button"
                            className="btn-deliver" 
                            style={{ flex: 1, padding: '8px', minHeight: '38px', fontSize: '0.8rem' }}
                            onClick={() => handleUpdateStatus(order.id || order._id, 'delivered')}
                          >
                            <FiPackage size={13} /> Delivered
                          </button>
                        )}
                        <select 
                          className="form-input" 
                          style={{ flex: 1, padding: '6px 8px', fontSize: '0.8rem', minHeight: '38px', background: '#1c1c22' }}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id || order._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsappOrders;
