import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('drakewears_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    // If we already have a cached token and user in localStorage, we are not blocking
    return !localStorage.getItem('token');
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.get('/auth/me')
        .then(res => {
          const updated = { ...res.data, token };
          setUser(updated);
          localStorage.setItem('drakewears_user', JSON.stringify(updated));
        })
        .catch(err => {
          // Only clear session if token is genuinely invalid or expired (401)
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('drakewears_user');
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('drakewears_user');
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('drakewears_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('drakewears_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const googleLogin = async (payload) => {
    const body = typeof payload === 'string' ? { credential: payload } : payload;
    const { data } = await API.post('/auth/google', body);
    localStorage.setItem('token', data.token);
    localStorage.setItem('drakewears_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('drakewears_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, loading, login, register, googleLogin, logout }}>{children}</AuthContext.Provider>;
}
