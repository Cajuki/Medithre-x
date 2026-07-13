import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import logo from '../Assets/med.png';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      const dest = user.role === 'admin' ? '/admin' : '/account';
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return { score: 0, label: '', color: 'bg-border' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const levels = [
      { score: 1, label: 'Weak', color: 'bg-danger' },
      { score: 2, label: 'Fair', color: 'bg-warning' },
      { score: 3, label: 'Good', color: 'bg-info' },
      { score: 4, label: 'Strong', color: 'bg-accent' },
    ];
    return levels[score - 1] || { score: 0, label: '', color: 'bg-border' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = form;
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    setLoading(true);
    try {
      const userData = await register({ name, email, phone, password });
      toast.success('Account created successfully!');
      // Role-based redirect
      const dest = userData.role === 'admin' ? '/admin' : '/account';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-3 mb-8">
            <img src={logo} alt="Medithrex" className="h-10 w-auto" />
            <div>
              <span className="text-xl font-bold text-charcoal">Medithrex</span>
              <span className="block text-[9px] font-medium text-secondary tracking-[0.2em] uppercase">Medical Equipment</span>
            </div>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-display font-extrabold text-charcoal mb-2">Create Account</h1>
            <p className="text-charcoal-400 text-sm">Join thousands of healthcare professionals</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input type="text" value={form.name} onChange={update('name')} className="form-input pl-10" placeholder="John Kamau" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input type="tel" value={form.phone} onChange={update('phone')} className="form-input pl-10" placeholder="+254 7XX XXX XXX" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input type="email" value={form.email} onChange={update('email')} className="form-input pl-10" placeholder="you@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    className="form-input pl-10 pr-10"
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="pw-strength-bar">
                      <div className={`pw-strength-fill ${strength.color}`} style={{ width: `${(strength.score / 4) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-charcoal-400 mt-1">Strength: {strength.label}</p>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    className="form-input pl-10"
                    placeholder="Repeat password"
                  />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="form-error"><X size={12} /> Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-xs text-charcoal-400 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-primary hover:text-primary-700">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary hover:text-primary-700">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-700">Sign in</Link>
          </p>

          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-400">
              <ShieldCheck size={14} className="text-secondary" /> Secure Registration
            </div>
            <div className="flex items-center gap-1.5 text-xs text-charcoal-400">
              <ShieldCheck size={14} className="text-secondary" /> Data Protected
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-dark via-primary to-primary-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <CheckCircle size={40} className="text-secondary" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-white mb-4">Join Medithrex Today</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Get access to exclusive benefits and streamline your medical equipment procurement
            </p>
            {[
              'Bulk pricing & corporate accounts',
              'Expedited quote processing',
              'Order tracking & history',
              'Product documentation downloads',
              'Priority customer support',
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-white/50 mb-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                {item}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Close X icon for password mismatch
function X({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
