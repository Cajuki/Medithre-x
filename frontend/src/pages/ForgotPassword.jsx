import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, LogIn } from 'lucide-react';
import { isValidEmail } from '../utils/validation.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { PRIMARY_PHONE, SECONDARY_PHONE } from '../config/contact.js';
import './AuthPages.css';

export default function ForgotPassword() {
  const [form, setForm] = useState({ email: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = request reset, 2 = check email
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValidEmail(form.email)) return toast.error('Enter a valid email address');
    setLoading(true);
    try {
      await forgotPassword(form.email.trim().toLowerCase());
      toast.success('If an account exists with that email, you will receive reset instructions.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset email. Please try again.');
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
              <span className="auth-logo-text">medithrex</span>
              <span className="auth-logo-sub">MEDICAL SOLUTIONS</span>
            </Link>
            <h1>Reset Your Password</h1>
            <p>Enter your email address to receive password reset instructions.</p>
            <div className="auth-contact">
              Need help? Call: <a href={PRIMARY_PHONE.href}>{PRIMARY_PHONE.display}</a> or <a href={SECONDARY_PHONE.href}>{SECONDARY_PHONE.display}</a>
            </div>
          </div>
          <div className="auth-brand-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1576086213369-97a306d36557?w=900&q=80)' }} />
        </div>

        {/* Form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <div className="auth-form-icon">{step === 1 ? <LogIn size={22} /> : <Mail size={22} />}</div>
              <h2>{step === 1 ? 'Forgot Password' : 'Check Your Email'}</h2>
              <p>{step === 1 ? 'Don\'t worry, it happens. Enter your email to reset your password.' : 'We\'ve sent password reset instructions to your email address.'}</p>
            </div>

            {step === 1 && (
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

                <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Send Reset Link <ArrowRight size={18} /></>}
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="auth-success">
                <CheckCircle size={48} />
                <h3>Reset Instructions Sent</h3>
                <p>If an account exists with {form.email}, you should receive an email with password reset instructions shortly.</p>
                <Link to="/login" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
