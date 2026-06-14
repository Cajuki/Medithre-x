import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

// ── API Base URL ──────────────────────────────────────────────────────────────
// In development: Vite proxy handles /api → localhost:8080
// In production: set VITE_API_URL in your .env.production file to your Cloud Run URL
//   e.g. VITE_API_URL=https://api.meditrex.site
const API_URL = import.meta.env.VITE_API_URL || '';
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ── Global interceptors ───────────────────────────────────────────────────────
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('❌ Cannot reach backend:', API_URL || 'localhost:8080');
    }
    if (error.response?.status === 401) {
      // Clear stale token on auth failure
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
        localStorage.removeItem('medithrex_token');
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
