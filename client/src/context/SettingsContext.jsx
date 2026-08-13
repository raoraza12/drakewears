import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const SettingsContext = createContext();
export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const applyTheme = (themeData) => {
    const root = document.documentElement;
    
    // Mapping of setting keys to CSS variable names
    const variableMap = {
      primaryColor: '--gold',
      secondaryColor: '--cream',
      bgColor: '--bg-dark',
      cardColor: '--bg-card',
      elevatedColor: '--bg-elevated',
      inputColor: '--bg-input',
      textPrimary: '--text-primary',
      textSecondary: '--text-secondary',
      borderRadius: '--radius',
      borderRadiusLg: '--radius-lg',
      navHeight: '--nav-height',
      fontHeading: '--font-heading',
      fontBody: '--font-body',
    };

    Object.entries(themeData).forEach(([key, value]) => {
      const varName = variableMap[key];
      if (varName) {
        if (key === 'borderRadius' || key === 'borderRadiusLg' || key === 'navHeight') {
          root.style.setProperty(varName, `${value}px`);
        } else if (key === 'fontHeading' || key === 'fontBody') {
           root.style.setProperty(varName, `"${value}", sans-serif`);
           // Handle fonts if needed (injecting google fonts link could be done here too)
        } else {
          root.style.setProperty(varName, value);
        }
      }
    });
  };

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/admin/settings');
      const formatted = {};
      data.forEach(s => formatted[s.key] = s.value);
      setSettings(formatted);
      // applyTheme(formatted); // Disabled to enforce strict Zara monochrome CSS theme
    } catch (err) {
      console.error('Failed to load site settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => fetchSettings();

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
