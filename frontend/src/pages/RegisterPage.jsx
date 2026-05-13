import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, UserPlus, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { isValidEmail, isValidKenyanPhone, normalizeKenyanPhone, KENYAN_PHONE_HINT } from '../utils/validation.js';
import toast from 'react-hot-toast';
import { BUSINESS_EMAIL, PRIMARY_PHONE, SECONDARY_PHONE } from '../config/contact.js';
import './AuthPages.css';

const KENYAN_COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Kitale','Garissa','Kakamega','Nyeri','Machakos','Meru','Embu','Kisii','Kilifi','Lamu','Isiolo','Marsabit','Mandera','Wajir','Turkana','West Pokot','Samburu','Trans Nzoia','Uasin Gishu','Elgeyo Marakwet','Nandi','Baringo','Laikipia','Nakuru','Narok','Kajiado','Kericho','Bomet','Kakamega','Vihiga','Bungoma','Busia','Siaya','Kisumu','Homa Bay','Migori','Kisii','Nyamira','Nairobi','Kiambu','Murang\'a','Kirinyaga','Nyeri','Nyandarua','Meru','Tharaka Nithi','Embu','Kitui','Machakos','Makueni','Garissa','Wajir','Mandera','Marsabit','Isiolo','Mombasa','Kwale','Kilifi','Tana River','Lamu','Taita Taveta'];

// Password strength checker
const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength = 'weak';
  let color = 'var(--red)';
  let label = 'Weak';

  if (score >= 4) {
    strength = 'strong';
    color = 'var(--green)';
    label = 'Strong';
  } else if (score >= 3) {
    strength = 'medium';
    color = 'var(--yellow)';
    label = 'Medium';
  }

  return { checks, score, strength, color, label };
};

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', county: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = checkPasswordStrength(form.password);
  const passwordsMatch = form.password && form.confirm && form.password === form.confirm;

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValidEmail(form.email)) return toast.error('Enter a valid email address');
    if (!isValidKenyanPhone(form.phone)) return toast.error(KENYAN_PHONE_HINT);
    if (passwordStrength.strength === 'weak') return toast.error('Password is too weak. Please create a stronger password.');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register({ ...form, email: form.email.trim().toLowerCase(), phone: normalizeKenyanPhone(form.phone) });
      toast.success('Account created! Welcome to medithrex.');
      navigate('/account');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
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
            <h2>Join Kenya's Healthcare Network</h2>
            <p>Create a free account to unlock seamless ordering, quote tracking, and personalized support for your facility.</p>
            <div className="auth-perks">
              {['Fast quote requests & tracking','Full order management dashboard','Exclusive institutional pricing','Priority delivery & support'].map(p => (
                <div key={p} className="auth-perk"><span className="perk-dot" />{p}</div>
              ))}
            </div>
            <div className="auth-contact">
              Questions? Call: <a href={PRIMARY_PHONE.href}>{PRIMARY_PHONE.display}</a> or <a href={SECONDARY_PHONE.href}>{SECONDARY_PHONE.display}</a>
            </div>
          </div>
          <div className="auth-brand-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&q=80)' }} />
        </div>

        {/* Form panel */}
        <div className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <div className="auth-form-icon"><UserPlus size={22} /></div>
              <h1>Create Account</h1>
              <p>Already registered? <Link to="/login">Sign in here</Link></p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" name="name" placeholder="Dr. Jane Wanjiru" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" name="phone" inputMode="tel" placeholder="0790 080 903" value={form.phone} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" name="email" placeholder="jane@hospital.co.ke" value={form.email} onChange={handleChange} required />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Organisation / Facility</label>
                  <input className="form-input" name="company" placeholder="Nairobi General Hospital" value={form.company} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">County</label>
                  <select className="form-select" name="county" value={form.county} onChange={handleChange}>
                    <option value="">Select county</option>
                    {[...new Set(KENYAN_COUNTIES)].sort().map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div className="password-wrap">
                    <input className="form-input" type={show ? 'text' : 'password'} name="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required />
                    <button type="button" className="password-toggle" onClick={() => setShow(!show)}>
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className={`strength-fill strength-${passwordStrength.strength}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="strength-label" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                  {form.password && (
                    <div className="password-requirements">
                      <div className={`requirement ${passwordStrength.checks.length ? 'met' : ''}`}>
                        {passwordStrength.checks.length ? <Check size={14} /> : <X size={14} />}
                        At least 8 characters
                      </div>
                      <div className={`requirement ${passwordStrength.checks.uppercase ? 'met' : ''}`}>
                        {passwordStrength.checks.uppercase ? <Check size={14} /> : <X size={14} />}
                        One uppercase letter
                      </div>
                      <div className={`requirement ${passwordStrength.checks.lowercase ? 'met' : ''}`}>
                        {passwordStrength.checks.lowercase ? <Check size={14} /> : <X size={14} />}
                        One lowercase letter
                      </div>
                      <div className={`requirement ${passwordStrength.checks.number ? 'met' : ''}`}>
                        {passwordStrength.checks.number ? <Check size={14} /> : <X size={14} />}
                        One number
                      </div>
                      <div className={`requirement ${passwordStrength.checks.special ? 'met' : ''}`}>
                        {passwordStrength.checks.special ? <Check size={14} /> : <X size={14} />}
                        One special character
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <div className="password-wrap">
                    <input className="form-input" type={show ? 'text' : 'password'} name="confirm" placeholder="Re-enter password" value={form.confirm} onChange={handleChange} required />
                    <button type="button" className="password-toggle" onClick={() => setShow(!show)}>
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {form.confirm && (
                    <div className="password-match">
                      {passwordsMatch ? (
                        <span style={{ color: 'var(--green)' }}>
                          <Check size={14} /> Passwords match
                        </span>
                      ) : form.password && form.confirm ? (
                        <span style={{ color: 'var(--red)' }}>
                          <AlertTriangle size={14} /> Passwords do not match
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <p className="auth-terms">
                By creating an account you agree to our{' '}
                <a href={`mailto:${BUSINESS_EMAIL}?subject=Terms%20of%20Service%20Request`}>Terms of Service</a> and{' '}
                <a href={`mailto:${BUSINESS_EMAIL}?subject=Privacy%20Policy%20Request`}>Privacy Policy</a>.
              </p>

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <>Create Account <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
