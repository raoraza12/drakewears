import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi';
import './Admin.css';

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ code: '', discountType: 'percentage', discountValue: '', expirationDate: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await API.get('/admin/coupons');
      setCoupons(res.data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/coupons', formData);
      toast.success('Coupon activated! 🎟️');
      setFormData({ code: '', discountType: 'percentage', discountValue: '', expirationDate: '' });
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deactivated');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  if (loading) return <div className="text-gold">Loading promotions...</div>;

  return (
    <div className="coupon-manager-wrapper">
      <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Marketing: Coupons</h2>
      
      {/* Create Coupon Form */}
      <form onSubmit={handleCreate} className="admin-form-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'end', marginBottom: '40px', padding: '24px' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="form-label text-xs uppercase font-bold" style={{ marginBottom: '8px' }}>Promo Code</label>
          <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="form-input" placeholder="e.g. DRAKEWEARS50" />
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="form-label text-xs uppercase font-bold" style={{ marginBottom: '8px' }}>Benefit Type</label>
          <select required value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="form-input">
            <option value="percentage">Percentage Off</option>
            <option value="fixed">Fixed Currency Off</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <label className="form-label text-xs uppercase font-bold" style={{ marginBottom: '8px' }}>Magnitude</label>
          <input required type="number" min="1" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} className="form-input" placeholder="e.g. 20" />
        </div>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label className="form-label text-xs uppercase font-bold" style={{ marginBottom: '8px' }}>Expiry Threshold</label>
          <input required type="date" value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})} className="form-input" />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
          <FiPlus /> Deploy
        </button>
      </form>

      {/* Coupon List */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Identifier</th>
              <th>Entitlement</th>
              <th>Threshold</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>No active promotional codes found.</td>
                </tr>
            ) : coupons.map(coupon => (
              <tr key={coupon._id}>
                <td style={{ fontWeight: '700', color: 'var(--gold)', letterSpacing: '0.1em' }}><FiTag size={12} style={{ marginRight: '8px' }} /> {coupon.code}</td>
                <td>{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '$'} Reduction</td>
                <td style={{ fontSize: '0.8rem', opacity: 0.6 }}>Valid until {new Date(coupon.expirationDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(coupon._id)} style={{ background: 'none', color: 'var(--red)', fontSize: '0.8rem' }} className="flex items-center gap-1">
                    <FiTrash2 size={16} /> Retire
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponManager;
