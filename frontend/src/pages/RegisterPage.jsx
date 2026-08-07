import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2,
  ShieldCheck, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import './AuthPages.css';
import logo from '../Assets/med.png';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [touched, setTouched] = useState({});
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

  const handleBlur = (field) => {
    setFocusedField(null);
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation
  const nameError = touched.name && form.name && form.name.length < 2;
  const nameValid = touched.name && form.name && form.name.length >= 2;
  const emailError = touched.email && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const emailValid = touched.email && form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneValid = !form.phone || (touched.phone && /^[\d\s\-\+\(\)]{7,}$/.test(form.phone));
  const passwordTouched = touched.password;

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return { score: 0, label: '', color: 'bg-border', width: '0%' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const levels = [
      { score: 1, label: 'Weak', color: 'bg-danger', width: '25%' },
      { score: 2, label: 'Fair', color: 'bg-warning', width: '50%' },
      { score: 3, label: 'Good', color: 'bg-info', width: '75%' },
      { score: 4, label: 'Strong', color: 'bg-accent', width: '100%' },
    ];
    return levels[score - 1] || { score: 0, label: '', color: 'bg-border', width: '0%' };
  };

  const strength = passwordStrength();

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword;
  const passwordsDontMatch = touched.confirmPassword && form.confirmPassword && form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFields = ['name', 'email', 'password', 'confirmPassword'];
    setTouched(prev => ({ ...prev, ...Object.fromEntries(allFields.map(f => [f, true])) }));

    const { name, email, phone, password, confirmPassword } = form;
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (name.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    if (emailError) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
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
      const dest = userData.role === 'admin' ? '/admin' : '/account';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Input field builder
  const Field = ({ field, label, icon: Icon, type = 'text', placeholder, options = {} }) => {
    const { extraPadding, validation, autoComplete } = options;
    const value = form[field];
    const isFocused = focusedField === field;
    const isTouched = touched[field];
    const hasError = isTouched && validation?.error;
    const isValid = isTouched && validation?.valid;
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="auth-input-group">
        <div className={`
          auth-input-wrap
          ${isFocused ? 'focused' : ''}
          ${hasError ? 'error' : ''}
          ${isValid ? 'valid' : ''}
        `}>
          <div className="auth-input-icon">
            <Icon size={17} className={isFocused ? 'text-primary' : 'text-charcoal-400'} />
          </div>
          <input
            type={inputType}
            value={value}
            onChange={update(field)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => handleBlur(field)}
            className={`auth-input ${isPassword ? 'auth-input--password' : ''}`}
            placeholder=" "
            autoComplete={autoComplete || type || 'off'}
          />
          <label className="auth-floating-label">{label}</label>
          <div className="auth-input-border" />
          <div className="auth-input-status">
            {hasError && <AlertCircle size={14} className="text-danger" />}
            {isValid && <CheckCircle size={14} className="text-accent" />}
          </div>
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-password-toggle"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {hasError && validation?.message && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="auth-field-error"
          >
            <AlertCircle size={11} />
            {validation.message}
          </motion.p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-white via-silver-50/30 to-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-[520px]"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
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
            className="mb-7"
          >
            <h1 className="text-[2rem] font-display font-extrabold text-charcoal mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-charcoal-400 text-[0.92rem] leading-relaxed">
              Join thousands of healthcare professionals
            </p>
            <div className="w-14 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4" />
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Row: Full Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                <Field
                  field="name"
                  label="Full Name"
                  icon={User}
                  options={{
                    autoComplete: 'name',
                    validation: {
                      error: nameError,
                      valid: nameValid,
                      message: 'Name must be at least 2 characters',
                    }
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5 }}
              >
                <Field
                  field="phone"
                  label="Phone Number"
                  icon={Phone}
                  type="tel"
                  options={{
                    autoComplete: 'tel',
                    validation: {
                      error: touched.phone && form.phone && !phoneValid,
                      valid: touched.phone && form.phone && phoneValid,
                      message: 'Invalid phone number',
                    }
                  }}
                />
              </motion.div>
            </div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-5"
            >
              <Field
                field="email"
                label="Email Address"
                icon={Mail}
                type="email"
                options={{
                  autoComplete: 'email',
                  validation: {
                    error: emailError,
                    valid: emailValid,
                    message: 'Please enter a valid email address',
                  }
                }}
              />
            </motion.div>

            {/* Row: Password + Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.33, duration: 0.5 }}
              >
                <Field
                  field="password"
                  label="Password"
                  icon={Lock}
                  type="password"
                  options={{
                    validation: {
                      error: touched.password && form.password && form.password.length < 8,
                      valid: touched.password && form.password && form.password.length >= 8,
                      message: 'Min. 8 characters',
                    }
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.5 }}
              >
                <Field
                  field="confirmPassword"
                  label="Confirm Password"
                  icon={Lock}
                  type="password"
                  options={{
                    validation: {
                      error: passwordsDontMatch,
                      valid: passwordsMatch,
                      message: 'Passwords do not match',
                    }
                  }}
                />
              </motion.div>
            </div>

            {/* Password Strength & Requirements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38, duration: 0.5 }}
            >
              {form.password && (
                <>
                  <div className="auth-pw-strength mt-3">
                    <div className="auth-pw-strength-bar">
                      <div
                        className={`auth-pw-strength-fill ${strength.color.replace('bg-', '')}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <span className="auth-pw-strength-label">{strength.label}</span>
                  </div>

                  <div className="auth-pw-requirements">
                    <div className={`auth-pw-req ${passwordChecks.length ? 'met' : ''}`}>
                      {passwordChecks.length ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      At least 8 characters
                    </div>
                    <div className={`auth-pw-req ${passwordChecks.uppercase ? 'met' : ''}`}>
                      {passwordChecks.uppercase ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      One uppercase letter
                    </div>
                    <div className={`auth-pw-req ${passwordChecks.number ? 'met' : ''}`}>
                      {passwordChecks.number ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      One number
                    </div>
                    <div className={`auth-pw-req ${passwordChecks.special ? 'met' : ''}`}>
                      {passwordChecks.special ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      One special character
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Terms Checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-5 mb-5"
            >
              <label className="auth-terms-checkbox">
                <div className="auth-checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="auth-checkbox-input"
                  />
                  <div className={`auth-checkbox-custom ${acceptedTerms ? 'checked' : ''}`}>
                    {acceptedTerms && <CheckCircle size={12} className="text-white" />}
                  </div>
                </div>
                <span className="auth-terms-text">
                  I agree to the{' '}
                  <Link to="/terms" className="auth-terms-link">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="auth-terms-link">Privacy Policy</Link>
                </span>
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.43, duration: 0.5 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <Loader2 size={20} className="animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2.5">
                    Create Account
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
            transition={{ delay: 0.47, duration: 0.5 }}
            className="auth-divider-custom"
          >
            <span>Already have an account?</span>
          </motion.div>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              to="/login"
              className="auth-alt-btn group"
            >
              Sign in to your account
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
              <span>Secure Registration</span>
            </div>
            <div className="auth-trust-dot" />
            <div className="auth-trust-item">
              <ShieldCheck size={13} className="text-accent" />
              <span>Data Protected</span>
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
              <User size={48} className="text-secondary" />
            </div>

            <h2 className="text-[2.5rem] font-display font-extrabold text-white mb-4 leading-tight tracking-tight">
              Join<br />
              <span className="text-secondary">Medithrex Today</span>
            </h2>

            <p className="text-white/50 text-[0.92rem] leading-relaxed mb-10 max-w-sm mx-auto">
              Get access to exclusive benefits and streamline your medical equipment procurement
            </p>

            {/* Feature list */}
            <div className="space-y-4 max-w-[320px] mx-auto">
              {[
                'Bulk pricing & corporate accounts',
                'Expedited quote processing',
                'Order tracking & history',
                'Product documentation downloads',
                'Priority customer support',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                  className="flex items-center gap-4 group cursor-default"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-secondary/15 group-hover:border-secondary/30">
                    <CheckCircle size={15} className="text-secondary/70" />
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