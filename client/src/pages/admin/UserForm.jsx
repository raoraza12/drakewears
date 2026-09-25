import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUser, FiSave } from 'react-icons/fi';
import './Admin.css';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    if (isEdit) {
      API.get('/admin/users')
      .then(res => {
        const user = res.data.find(u => u.id === id || u._id === id);
        if (user) {
          setForm({ name: user.name, email: user.email, role: user.role, password: '' });
        }
      })
      .catch(() => toast.error('Error loading stakeholder data'));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await API.put(`/admin/users/${id}/role`, { role: form.role });
        toast.success('Access level modified! ✨');
      } else {
        await API.post('/admin/users', form);
        toast.success('Stakeholder registered! ✨');
      }
      navigate('/drakewearsofficial/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    }
  };

  return (
    <div className="user-form-wrapper" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={() => navigate('/drakewearsofficial/users')} className="btn-ghost" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <FiArrowLeft /> Back to Accounts
        </button>
        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>{isEdit ? 'Profile: Update' : 'Account: New'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <div className="form-group">
          <label className="form-label">Stakeholder Name</label>
          <div style={{ position: 'relative' }}>
            <FiUser style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input 
              required 
              disabled={isEdit}
              className="form-input" 
              style={{ paddingLeft: '45px', opacity: isEdit ? 0.6 : 1 }}
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              placeholder="e.g. Alexander McQueen" 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Designation</label>
          <input 
            required 
            type="email"
            disabled={isEdit}
            className="form-input" 
            style={{ opacity: isEdit ? 0.6 : 1 }}
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            placeholder="stakeholder@example.com" 
          />
        </div>

        {!isEdit && (
          <div className="form-group">
            <label className="form-label">Access Passcode</label>
            <input 
              required 
              type="password"
              className="form-input" 
              value={form.password} 
              onChange={e => setForm({...form, password: e.target.value})} 
              placeholder="••••••••" 
            />
          </div>
        )}

        <div className="form-group" style={{ marginBottom: '40px' }}>
          <label className="form-label">Permission Tier</label>
          <select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="user">Standard Stakeholder</option>
            <option value="admin">Global Administrator</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '18px' }}>
          <FiSave /> {isEdit ? 'Update Permissons' : 'Authorize Account'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;
