import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // Safely get token from localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem('medithrex_token');
      } catch (e) {
        // If localStorage is inaccessible due to tracking prevention, return null
        console.warn('Unable to access localStorage due to tracking prevention');
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        axios.post('/api/auth/logout').catch(() => {});
        logout();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
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
     // Safely set token in localStorage
     if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
       try {
         localStorage.setItem('medithrex_token', t);
       } catch (e) {
         // If localStorage is inaccessible due to tracking prevention, continue without storing
         console.warn('Unable to store token in localStorage due to tracking prevention');
       }
     }
     axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
     setToken(t);
     setUser(u);
     return u;
   };

   const register = async (data) => {
     const res = await axios.post('/api/auth/register', data);
     const { token: t, user: u } = res.data;
     // Safely set token in localStorage
     if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
       try {
         localStorage.setItem('medithrex_token', t);
       } catch (e) {
         // If localStorage is inaccessible due to tracking prevention, continue without storing
         console.warn('Unable to store token in localStorage due to tracking prevention');
       }
     }
     axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
     setToken(t);
     setUser(u);
     return u;
   };

  const forgotPassword = async (email) => {
    await axios.post('/api/auth/forgot-password', { email });
  };

  const resetPassword = async (token, newPassword) => {
    await axios.post('/api/auth/reset-password', { token, newPassword });
  };

   const logout = () => {
     // Safely remove token from localStorage
     if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
       try {
         localStorage.removeItem('medithrex_token');
       } catch (e) {
         // If localStorage is inaccessible due to tracking prevention, continue anyway
         console.warn('Unable to remove token from localStorage due to tracking prevention');
       }
     }
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
    <AuthContext.Provider value={{ user, token, loading, login, register, forgotPassword, resetPassword, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

