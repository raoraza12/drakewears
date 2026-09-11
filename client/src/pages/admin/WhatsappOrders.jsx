import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiPlus } from 'react-icons/fi';
import API from '../../api';
import toast from 'react-hot-toast';

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
          <form className="panel-body" onSubmit={handleCreateOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-primary">Save Order</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-panel">
        <div className="panel-body">
          {loading ? <p>Loading...</p> : (
            <table className="admin-table">
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
                ) : orders.map(order => (
                  <tr key={order.id || order._id}>
                    <td>#{String(order.id || order._id).slice(-6).toUpperCase()}</td>
                    <td>{order.shippingAddress?.name || order.user?.name}</td>
                    <td>{order.shippingAddress?.phone || (order.notes && order.notes.split('Phone: ')[1]) || 'N/A'}</td>
                    <td>Rs. {order.total}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${order.status === 'delivered' ? 'completed' : order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {order.status !== 'delivered' && order.status !== 'completed' ? (
                        <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(order.id || order._id, 'delivered')}>
                          Mark Delivered
                        </button>
                      ) : (
                        <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} disabled>Done</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsappOrders;
