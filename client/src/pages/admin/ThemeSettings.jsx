import React, { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import API from '../../api';
import toast from 'react-hot-toast';

const ThemeSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeName: 'drakewears',
    currency: 'RS',
    shippingFee: 150,
    contactEmail: 'contact@drakewearsbrand.com',
    contactPhone: '0300-0000000'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/admin/settings');
      if (res.data && res.data.length > 0) {
        const loadedSettings = {};
        res.data.forEach(item => {
          loadedSettings[item.key] = item.value;
        });
        setSettings(prev => ({ ...prev, ...loadedSettings }));
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/admin/settings/bulk', { settings });
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ 
      ...prev, 
      [name]: name === 'shippingFee' ? Number(value) : value 
    }));
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="panel-header" style={{ padding: '0 0 24px 0', borderBottom: 'none' }}>
        <h1 className="h2">Store Settings</h1>
        <p className="text-body" style={{ marginTop: '8px' }}>Configure your global store preferences.</p>
      </div>

      <div className="admin-panel" style={{ maxWidth: '600px' }}>
        {loading ? <div className="panel-body"><p>Loading settings...</p></div> : (
          <form className="panel-body" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500' }}>Store Name</label>
              <input type="text" name="storeName" value={settings.storeName} onChange={handleChange} required className="form-input" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500' }}>Currency Symbol</label>
              <input type="text" name="currency" value={settings.currency} onChange={handleChange} required className="form-input" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500' }}>Default Shipping Fee</label>
              <input type="number" name="shippingFee" value={settings.shippingFee} onChange={handleChange} required className="form-input" />
            </div>

            <div className="gold-divider" style={{ opacity: 0.2 }}></div>

            <h3 className="h3" style={{ fontSize: '1.1rem' }}>Contact Information</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500' }}>Support Email</label>
              <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} required className="form-input" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500' }}>WhatsApp / Phone</label>
              <input type="text" name="contactPhone" value={settings.contactPhone} onChange={handleChange} required className="form-input" />
            </div>

            <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '12px', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FiSave /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ThemeSettings;
