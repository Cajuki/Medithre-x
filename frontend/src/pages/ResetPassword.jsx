import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true/false = result
  const [validating, setValidating] = useState(true);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setValidating(false);
        return;
      }
      try {
        const res = await axios.get(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        setTokenValid(res.data.valid);
      } catch (err) {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };
    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      return toast.error('Please fill in all fields');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password reset successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-page">
        <div className="auth-split">
          <div className="auth-brand">
            <div className="auth-brand-content">
              <Link to="/" className="auth-logo">
                <span className="auth-logo-text">medithrex</span>
                <span className="auth-logo-sub">MEDICAL SOLUTIONS</span>
              </Link>
              <h1>Verifying...</h1>
            </div>
            <div className="auth-brand-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576086213369-97a306d36557?w=900&q=80)' }} />
          </div>
          <div className="auth-form-panel">
            <div className="auth-form-wrap">
              <p>Please wait while we verify your reset token.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="auth-page">
        <div className="auth-split">
          <div className="auth-brand">
            <div className="auth-brand-content">
              <Link to="/" className="auth-logo">
                <span className="auth-logo-text">medithrex</span>
                <span className="auth-logo-sub">MEDICAL SOLUTIONS</span>
              </Link>
              <h1>Invalid Reset Link</h1>
            </div>
            <div className="auth-brand-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576086213369-97a306d36557?w=900&q=80)' }} />
          </div>
          <div className="auth-form-panel">
            <div className="auth-form-wrap">
              <div style={{ textAlign: 'center', color: '#e74c3c' }}>
                <AlertCircle size={48} />
                <h3>Reset Link Invalid or Expired</h3>
                <p>The password reset link is invalid, has already been used, or has expired. Please request a new one.</p>
                <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: '20px' }}>
                  Request New Reset Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Brand panel */}
        <div className="auth-brand">
          <div className="auth-brand-content">
            <Link to="/" className="auth-logo">
              <span className="auth-logo-text">medithrex</span>
              <span className="auth-logo-sub">MEDICAL SOLUTIONS</span>
            </Link>
            <h1>Reset Your Password</h1>
            <p>Enter your new password below.</p>
          </div>
          <div className="auth-brand-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576086213369-97a306d36557?w=900&q=80)' }} />
        </div>

        {/* Form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <div className="auth-form-icon"><Lock size={22} /></div>
              <h2>Set New Password</h2>
              <p>Your reset link is valid. Choose a strong password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Reset Password <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
