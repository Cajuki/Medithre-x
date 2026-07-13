import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import logo from '../Assets/med.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset email');
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
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-3 mb-10">
            <img src={logo} alt="Medithrex" className="h-10 w-auto" />
            <div>
              <span className="text-xl font-bold text-charcoal">Medithrex</span>
              <span className="block text-[9px] font-medium text-secondary tracking-[0.2em] uppercase">Medical Equipment</span>
            </div>
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent-light flex items-center justify-center">
                <CheckCircle size={36} className="text-accent-dark" />
              </div>
              <h1 className="text-2xl font-display font-extrabold text-charcoal mb-3">Check Your Email</h1>
              <p className="text-sm text-charcoal-400 mb-6">
                We've sent a password reset link to <strong className="text-charcoal">{email}</strong>
              </p>
              <Link to="/login" className="btn btn-primary">
                Back to Login <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-display font-extrabold text-charcoal mb-2">Forgot Password?</h1>
                <p className="text-charcoal-400 text-sm">Enter your email and we'll send you a reset link</p>
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

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>

              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-charcoal-400 hover:text-primary mt-6 transition-colors">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </>
          )}
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
              <ShieldCheck size={40} className="text-secondary" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-white mb-4">Secure Password Reset</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              We'll send a secure link to your email. Click it to reset your password and regain access to your account.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}