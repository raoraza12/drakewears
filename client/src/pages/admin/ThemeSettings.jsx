import { useState, useEffect } from 'react';
import { 
  FiSave, FiMonitor, FiSliders, FiGlobe, FiInfo, FiType, FiLayout, 
  FiDroplet, FiSmartphone, FiImage, FiMail, FiPhone, FiTag 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../api';
import { useSettings } from '../../context/SettingsContext';
import './Admin.css';

const TABS = [
  { id: 'branding', name: 'Branding', icon: <FiGlobe /> },
  { id: 'colors', name: 'Colors', icon: <FiDroplet /> },
  { id: 'typography', name: 'Typography', icon: <FiType /> },
  { id: 'layout', name: 'Layout', icon: <FiLayout /> },
  { id: 'hero', name: 'Homepage', icon: <FiMonitor /> },
];

const FONTS = [
  'Inter', 'Playfair Display', 'Roboto', 'Montserrat', 'Poppins', 'Lato', 'Oswald', 'Lora'
];

export default function ThemeSettings() {
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Branding
    siteName: 'NOOR BRAND',
    contactEmail: 'contact@luxe.com',
    contactPhone: '+92 300 1234567',
    
    // Colors
    primaryColor: '#c9a84c',
    secondaryColor: '#f5f0e8',
    bgColor: '#0d0d0f',
    cardColor: '#13131a',
    elevatedColor: '#1a1a24',
    inputColor: '#1e1e2c',
    textPrimary: '#f5f0e8',
    textSecondary: '#a09880',
    
    // Typography
    fontHeading: 'Playfair Display',
    fontBody: 'Inter',
    
    // Layout
    borderRadius: 12,
    borderRadiusLg: 20,
    navHeight: 75,
    
    // Hero
    homeHeroTitle: 'ELITE LUXURY FOR YOU',
    homeHeroSub: 'Experience the fine craft of premium tailored clothing.',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/admin/settings');
      const formatted = {};
      data.forEach(s => formatted[s.key] = s.value);
      if (Object.keys(formatted).length > 0) {
        setSettings(prev => ({ ...prev, ...formatted }));
      }
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  const saveAll = async () => {
    setLoading(true);
    try {
      await API.post('/admin/settings/bulk', { settings });
      toast.success('Theme intelligence updated! ✨');
      refreshSettings(); // Refresh global theme
    } catch (err) {
      toast.error('System synchronization failed.');
    }
    setLoading(false);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="theme-settings-container anim-fadeIn">
      <div className="admin-header">
        <div className="header-info">
          <span className="gold-label">Visual Intelligence</span>
          <h1>System Aesthetics</h1>
          <p>Fine-tune every pixel of the NOOR Brand experience.</p>
        </div>
        <button className="btn-primary" onClick={saveAll} disabled={loading}>
          <FiSave />
          {loading ? 'Synchronizing...' : 'Apply Global Theme'}
        </button>
      </div>

      <div className="settings-layout">
        {/* Tab Navigation */}
        <div className="settings-tabs">
          {TABS.map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="settings-content-wrap">
          {activeTab === 'branding' && (
            <div className="tab-pane">
              <div className="admin-card">
                <div className="card-header-icon"><FiGlobe /> <h4>Global Identity</h4></div>
                <div className="settings-grid-2">
                  <div className="form-group">
                    <label className="form-label">Site Name</label>
                    <div className="input-with-icon">
                      <FiTag className="icon" />
                      <input className="form-input" value={settings.siteName} onChange={e => updateSetting('siteName', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Support Email</label>
                    <div className="input-with-icon">
                      <FiMail className="icon" />
                      <input className="form-input" value={settings.contactEmail} onChange={e => updateSetting('contactEmail', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <div className="input-with-icon">
                      <FiPhone className="icon" />
                      <input className="form-input" value={settings.contactPhone} onChange={e => updateSetting('contactPhone', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="tab-pane">
              <div className="admin-card">
                <div className="card-header-icon"><FiDroplet /> <h4>Brand Colors</h4></div>
                <div className="settings-grid-2">
                  <div className="form-group">
                    <label className="form-label">Primary Accent (Gold)</label>
                    <div className="color-picker-wrap">
                      <input type="color" value={settings.primaryColor} onChange={e => updateSetting('primaryColor', e.target.value)} />
                      <code>{settings.primaryColor}</code>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Secondary Accent (Cream)</label>
                    <div className="color-picker-wrap">
                      <input type="color" value={settings.secondaryColor} onChange={e => updateSetting('secondaryColor', e.target.value)} />
                      <code>{settings.secondaryColor}</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <div className="card-header-icon"><FiMonitor /> <h4>Backgrounds & Surface</h4></div>
                <div className="settings-grid-3">
                  <div className="form-group">
                    <label className="form-label">Deep Background</label>
                    <input type="color" className="color-input-large" value={settings.bgColor} onChange={e => updateSetting('bgColor', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Card Surface</label>
                    <input type="color" className="color-input-large" value={settings.cardColor} onChange={e => updateSetting('cardColor', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Input / Elevated</label>
                    <input type="color" className="color-input-large" value={settings.inputColor} onChange={e => updateSetting('inputColor', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <div className="card-header-icon"><FiType /> <h4>Text Colors</h4></div>
                <div className="settings-grid-2">
                  <div className="form-group">
                    <label className="form-label">Primary Text</label>
                    <input type="color" className="color-input-large" value={settings.textPrimary} onChange={e => updateSetting('textPrimary', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Secondary / Muted</label>
                    <input type="color" className="color-input-large" value={settings.textSecondary} onChange={e => updateSetting('textSecondary', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="tab-pane">
              <div className="admin-card">
                <div className="card-header-icon"><FiType /> <h4>Typography Selection</h4></div>
                <div className="settings-grid-2">
                  <div className="form-group">
                    <label className="form-label">Heading Font</label>
                    <select className="form-input" value={settings.fontHeading} onChange={e => updateSetting('fontHeading', e.target.value)}>
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <p className="preview-text" style={{ fontFamily: settings.fontHeading, fontSize: '1.5rem', marginTop: '10px' }}>
                      Premium Haute Couture
                    </p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Body Font</label>
                    <select className="form-input" value={settings.fontBody} onChange={e => updateSetting('fontBody', e.target.value)}>
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <p className="preview-text" style={{ fontFamily: settings.fontBody, fontSize: '0.9rem', marginTop: '10px', opacity: 0.7 }}>
                      Experience the fine craft of premium tailored clothing with Inter and other modern sans-serif fonts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="tab-pane">
              <div className="admin-card">
                <div className="card-header-icon"><FiLayout /> <h4>Layout & Spacing</h4></div>
                <div className="settings-grid-3">
                  <div className="form-group">
                    <label className="form-label">Border Radius (px)</label>
                    <input type="range" min="0" max="40" value={settings.borderRadius} onChange={e => updateSetting('borderRadius', parseInt(e.target.value))} />
                    <div className="range-val">{settings.borderRadius}px</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Large Radius (px)</label>
                    <input type="range" min="0" max="60" value={settings.borderRadiusLg} onChange={e => updateSetting('borderRadiusLg', parseInt(e.target.value))} />
                    <div className="range-val">{settings.borderRadiusLg}px</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Navigation Height (px)</label>
                    <input type="number" className="form-input" value={settings.navHeight} onChange={e => updateSetting('navHeight', parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="tab-pane">
              <div className="admin-card">
                <div className="card-header-icon"><FiImage /> <h4>Homepage Banner</h4></div>
                <div className="form-group">
                  <label className="form-label">Hero Main Title</label>
                  <input className="form-input" value={settings.homeHeroTitle} onChange={e => updateSetting('homeHeroTitle', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hero Subtitle</label>
                  <textarea className="form-input" rows={4} value={settings.homeHeroSub} onChange={e => updateSetting('homeHeroSub', e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="theme-disclaimer">
        <FiInfo />
        <span>Changes made here are applied globally across all storefront modules. Large font changes may take a few seconds to propagate.</span>
      </div>
    </div>
  );
}
