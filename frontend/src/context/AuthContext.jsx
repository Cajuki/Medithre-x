import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medithrex_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/profile');
      setUser(res.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('medithrex_token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await axios.post('/api/auth/register', data);
    const { token: t, user: u } = res.data;
    localStorage.setItem('medithrex_token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
    return u;
  };

  const forgotPassword = async (email) => {
    await axios.post('/api/auth/forgot-password', { email });
  };

  const logout = () => {
    localStorage.removeItem('medithrex_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await axios.put('/api/auth/profile', data);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, forgotPassword, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
