import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { isValidEmail } from '../utils/validation.js';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get('next') || '/account';

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValidEmail(form.email)) return toast.error('Enter a valid email address');
    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      toast.success('Welcome back!');
      navigate(next);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Brand panel */}
        <div className="auth-brand">
          <div className="auth-brand-content">
            <Link to="/" className="auth-logo">
              <span className="auth-logo-text">MEDITHREX</span>
              <span className="auth-logo-sub">MEDICAL SOLUTIONS</span>
            </Link>
            <h2>Kenya's Premier Medical Equipment Platform</h2>
            <p>Sign in to your account to manage orders, track quotes, and access exclusive pricing for your healthcare institution.</p>
            <div className="auth-perks">
              {['Track orders in real-time','Request & manage quotes','Dedicated account support','Access full product catalogue'].map(p => (
                <div key={p} className="auth-perk"><span className="perk-dot" />{p}</div>
              ))}
            </div>
            <div className="auth-contact">
              Need help? Call: <a href="tel:0790080903">0790 080 903</a>
            </div>
          </div>
          <div className="auth-brand-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576086213369-97a306d36557?w=900&q=80)' }} />
        </div>

        {/* Form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <div className="auth-form-icon"><LogIn size={22} /></div>
              <h1>Sign In</h1>
              <p>Don't have an account? <Link to="/register">Create one free</Link></p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  placeholder="you@institution.co.ke"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-wrap">
                  <input
                    className="form-input"
                    type={show ? 'text' : 'password'}
                    name="password"
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShow(!show)}>
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="auth-divider">or</div>
            <div className="auth-alt">
              <p>No account needed for quotes:</p>
              <Link to="/quote" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                Request a Quote Directly
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
