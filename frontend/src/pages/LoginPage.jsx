import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import logo from '../Assets/med.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10">
            <img src={logo} alt="Medithrex" className="h-10 w-auto" />
            <div>
              <span className="text-xl font-bold text-charcoal">Medithrex</span>
              <span className="block text-[9px] font-medium text-secondary tracking-[0.2em] uppercase">Medical Equipment</span>
            </div>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-extrabold text-charcoal mb-2">Welcome Back</h1>
            <p className="text-charcoal-400 text-sm">Sign in to your account to continue shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-medium text-primary hover:text-primary-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-700 transition-colors">
              Create one
            </Link>
          </p>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-400">
              <ShieldCheck size={14} className="text-secondary" /> Secure Login
            </div>
            <div className="flex items-center gap-1.5 text-xs text-charcoal-400">
              <ShieldCheck size={14} className="text-secondary" /> Encrypted
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-dark via-primary to-primary-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <ShieldCheck size={40} className="text-secondary" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-white mb-4">Your Trusted Medical Partner</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Access your orders, quotes, and account information all in one place. 
              Manage your healthcare equipment procurement with ease.
            </p>
            <div className="mt-8 space-y-4">
              {[
                'Track your orders in real-time',
                'Request quotes for bulk equipment',
                'Access product documentation',
                'Manage your company profile',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-white/50"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
