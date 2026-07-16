import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import logo from '../Assets/med.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      const dest = user.role === 'admin' ? '/admin' : '/account';
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  // Validation
  const emailError = touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailValid = touched.email && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordError = touched.password && password && password.length < 1;
  const isFormValid = email && password && !emailError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (emailError) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const userData = await login(email, password);
      toast.success(`Welcome back, ${userData.name}!`);
      // Role-based redirect
      const dest = userData.role === 'admin' ? '/admin' : '/account';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field) => {
    setFocusedField(null);
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-white via-silver-50/30 to-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-[440px]"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
              <div className="relative">
                <img src={logo} alt="Medithrex" className="h-11 w-auto transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div>
                <span className="text-xl font-bold text-charcoal tracking-tight">Medithrex</span>
                <span className="block text-[8px] font-semibold text-secondary tracking-[0.25em] uppercase">Medical Equipment</span>
              </div>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-9"
          >
            <h1 className="text-[2rem] font-display font-extrabold text-charcoal mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-charcoal-400 text-[0.92rem] leading-relaxed">
              Sign in to your account to access orders, quotes, and more
            </p>
            <div className="w-14 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4" />
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-5"
            >
              <div className="auth-input-group">
                <div className={`auth-input-wrap ${focusedField === 'email' ? 'focused' : ''} ${emailError ? 'error' : ''} ${emailValid ? 'valid' : ''}`}>
                  <div className="auth-input-icon">
                    <Mail size={17} className={focusedField === 'email' ? 'text-primary' : 'text-charcoal-400'} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => handleBlur('email')}
                    className="auth-input"
                    placeholder=" "
                    autoComplete="email"
                    autoFocus
                  />
                  <label className="auth-floating-label">Email Address</label>
                  <div className="auth-input-border" />
                  <div className="auth-input-status">
                    {emailError && <AlertCircle size={14} className="text-danger" />}
                    {emailValid && <CheckCircle size={14} className="text-accent" />}
                  </div>
                </div>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="auth-field-error"
                  >
                    <AlertCircle size={11} />
                    Please enter a valid email address
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="text-[11px] font-semibold text-charcoal-600 tracking-wide uppercase">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-primary hover:text-primary-700 transition-all duration-200 hover:underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
              <div className={`auth-input-wrap ${focusedField === 'password' ? 'focused' : ''}`}>
                <div className="auth-input-icon">
                  <Lock size={17} className={focusedField === 'password' ? 'text-primary' : 'text-charcoal-400'} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => handleBlur('password')}
                  className="auth-input auth-input--password"
                  placeholder=" "
                  autoComplete="current-password"
                />
                <label className="auth-floating-label">Enter your password</label>
                <div className="auth-input-border" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <Loader2 size={20} className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2.5">
                    Sign In
                    <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="auth-divider-custom"
          >
            <span>New to Medithrex?</span>
          </motion.div>

          {/* Create Account Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              to="/register"
              className="auth-alt-btn group"
            >
              Create your account
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="auth-trust-badges"
          >
            <div className="auth-trust-item">
              <ShieldCheck size={13} className="text-accent" />
              <span>Secure Login</span>
            </div>
            <div className="auth-trust-dot" />
            <div className="auth-trust-item">
              <ShieldCheck size={13} className="text-accent" />
              <span>Encrypted</span>
            </div>
            <div className="auth-trust-dot" />
            <div className="auth-trust-item">
              <ShieldCheck size={13} className="text-accent" />
              <span>HIPAA Compliant</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-dark via-[#0B3D7A] to-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-secondary/8 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/4 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-600/15 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/8 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl">
              <ShieldCheck size={48} className="text-secondary" />
            </div>

            <h2 className="text-[2.5rem] font-display font-extrabold text-white mb-4 leading-tight tracking-tight">
              Your Trusted<br />
              <span className="text-secondary">Medical Partner</span>
            </h2>

            <p className="text-white/50 text-[0.92rem] leading-relaxed mb-10 max-w-sm mx-auto">
              Access your orders, quotes, and account information all in one place. 
              Manage your healthcare equipment procurement with ease.
            </p>

            {/* Feature list */}
            <div className="space-y-4 max-w-[320px] mx-auto">
              {[
                'Track your orders in real-time',
                'Request quotes for bulk equipment',
                'Access product documentation',
                'Manage your company profile',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.5, ease: 'easeOut' }}
                  className="flex items-center gap-4 group cursor-default"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-secondary/15 group-hover:border-secondary/30">
                    <div className="w-2 h-2 rounded-full bg-secondary/70" />
                  </div>
                  <span className="text-white/55 text-sm group-hover:text-white/80 transition-colors duration-300">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Bottom accent line */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="w-12 h-0.5 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-secondary/50" />
              <div className="w-12 h-0.5 rounded-full bg-white/10" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}