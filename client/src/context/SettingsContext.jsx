import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'drakewears',
    currency: 'RS',
    shippingFee: 150,
    contactEmail: 'contact@drakewearsbrand.com',
    contactPhone: '0300-0000000'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings');
        if (res.data && Object.keys(res.data).length > 0) {
          // ensure numerical fields are mapped
          if (res.data.shippingFee !== undefined) res.data.shippingFee = Number(res.data.shippingFee);
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Failed to load global settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
