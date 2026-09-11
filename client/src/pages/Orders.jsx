import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiClock } from 'react-icons/fi';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const STATUS_COLORS = { pending: '#c9a84c', confirmed: '#4299e1', processing: '#9f7aea', shipped: '#38b2ac', delivered: '#55c688', cancelled: '#e05555' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    API.get('/orders/mine').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="page-wrapper empty-page"><p>Please <Link to="/login">login</Link> to view orders</p></div>;

  return (
    <div className="page-wrapper">
      <div className="container orders-page">
        <h1 className="orders-title">My Orders</h1>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-page" style={{ paddingTop: 60 }}>
            <FiPackage size={56} />
            <h3>No orders yet</h3>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id || order._id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">Order #{(order.id || order._id || '').slice(-8).toUpperCase()}</span>
                  <span className="order-date"><FiClock size={12} /> {new Date(order.createdAt).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}</span>
                </div>
                <div className="order-right">
                  <span className="order-status" style={{ background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status], borderColor: STATUS_COLORS[order.status] + '44' }}>
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
                    <div>
                      <p className="order-item-name">{item.name}</p>
                      <p className="order-item-meta">Qty: {item.quantity}{item.size && ` · Size: ${item.size}`}</p>
                    </div>
                    <span className="order-item-price">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="order-card-footer">
                <span className="order-payment">{order.paymentMethod} · {order.paymentStatus}</span>
                {order.shippingAddress?.city && (
                  <span className="order-ship-to">Ships to: {order.shippingAddress.city}, {order.shippingAddress.country}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
