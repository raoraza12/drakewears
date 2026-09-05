import React, { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';

const STATUS_COLORS = { pending: '#c9a84c', processing: '#9f7aea', shipped: '#38b2ac', delivered: '#55c688', cancelled: '#e05555' };

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.put(`/admin/orders/${id}`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      setOrders(orders.map(o => o.id === id || o._id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="panel-header" style={{ padding: '0 0 24px 0', borderBottom: 'none' }}>
        <h1 className="h2">Web Orders</h1>
        <p className="text-body" style={{ marginTop: '8px' }}>Manage all standard website orders (COD, Online).</p>
      </div>

      <div className="admin-panel">
        <div className="panel-body">
          {loading ? <p>Loading orders...</p> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No web orders found</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id || order._id}>
                    <td>#{String(order.id || order._id).slice(-6).toUpperCase()}</td>
                    <td>
                      {order.shippingAddress?.name || order.user?.name}<br/>
                      <small style={{ color: 'var(--text-secondary)' }}>{order.user?.email}</small>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>Rs. {order.total.toLocaleString()}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <span className="status-badge" style={{ 
                        background: (STATUS_COLORS[order.status] || '#ccc') + '22', 
                        color: STATUS_COLORS[order.status] || '#ccc',
                        border: `1px solid ${STATUS_COLORS[order.status] || '#ccc'}44`
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="form-input" 
                        style={{ padding: '6px', fontSize: '0.8rem', width: 'auto' }}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id || order._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
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

export default OrderManager;
