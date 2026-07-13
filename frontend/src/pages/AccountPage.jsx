import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { isValidKenyanPhone, normalizeKenyanPhone, KENYAN_PHONE_HINT } from '../utils/validation.js';
import {
  User, Package, FileText, LogOut, ChevronRight,
  CheckCircle, Clock, Truck, XCircle, Edit3, Save,
  LayoutDashboard, ShoppingCart, ArrowRight, Phone, Mail,
  Building2, MapPin, Loader2, Heart, Settings, BarChart3
} from 'lucide-react';

/* ── Status Badge ──────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Pending: { cls: 'bg-warning-light text-warning-dark border-warning/30', icon: <Clock size={11} /> },
    Confirmed: { cls: 'bg-primary-100 text-primary border-primary/20', icon: <CheckCircle size={11} /> },
    Processing: { cls: 'bg-info-light text-info border-info/20', icon: <Clock size={11} /> },
    Shipped: { cls: 'bg-primary-100 text-primary border-primary/20', icon: <Truck size={11} /> },
    Delivered: { cls: 'bg-accent-light text-accent-dark border-accent/20', icon: <CheckCircle size={11} /> },
    Cancelled: { cls: 'bg-danger-light text-danger border-danger/20', icon: <XCircle size={11} /> },
    New: { cls: 'bg-warning-light text-warning-dark border-warning/30', icon: <Clock size={11} /> },
    Reviewed: { cls: 'bg-primary-100 text-primary border-primary/20', icon: <CheckCircle size={11} /> },
    Quoted: { cls: 'bg-accent-light text-accent-dark border-accent/20', icon: <CheckCircle size={11} /> },
    Accepted: { cls: 'bg-accent-light text-accent-dark border-accent/20', icon: <CheckCircle size={11} /> },
    Declined: { cls: 'bg-danger-light text-danger border-danger/20', icon: <XCircle size={11} /> },
  };
  const s = map[status] || { cls: 'bg-section text-charcoal-400 border-border', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.cls}`}>
      {s.icon} {status}
    </span>
  );
}

/* ── Sidebar ──────────────────────────────────────── */
function Sidebar({ active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const links = [
    { path: '/account', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { path: '/account/orders', label: 'My Orders', icon: <ShoppingCart size={17} /> },
    { path: '/account/quotes', label: 'My Quotes', icon: <FileText size={17} /> },
    { path: '/account/profile', label: 'Profile Settings', icon: <Settings size={17} /> },
  ];

  return (
    <div className="w-full lg:w-64 shrink-0">
      <div className="lg:sticky lg:top-24 premium-card p-4 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-charcoal truncate">{user?.name}</p>
            <p className="text-[10px] text-charcoal-400 truncate">{user?.company || user?.email}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map(l => (
            <Link
              key={l.path}
              to={l.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active === l.path
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-charcoal-600 hover:text-charcoal hover:bg-section'
              }`}
            >
              {l.icon} {l.label}
              <ChevronRight size={13} className="ml-auto opacity-50" />
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-charcoal-600 hover:text-danger hover:bg-danger-light/30 transition-all w-full"
          >
            <LogOut size={17} /> Sign Out
          </button>
        </nav>

        {/* Quick actions */}
        <div className="pt-4 border-t border-border space-y-2">
          <Link to="/products" className="flex items-center gap-2 text-xs text-charcoal-400 hover:text-primary transition-colors">
            <Package size={14} /> Browse Products <ArrowRight size={12} className="ml-auto" />
          </Link>
          <Link to="/quote" className="flex items-center gap-2 text-xs text-charcoal-400 hover:text-primary transition-colors">
            <FileText size={14} /> Request Quote <ArrowRight size={12} className="ml-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────── */
function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/orders/my').catch(() => ({ data: [] })),
      axios.get('/api/quotes/my').catch(() => ({ data: [] })),
    ]).then(([o, q]) => {
      setOrders(o.data || []);
      setQuotes(q.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: <ShoppingCart size={18} />, color: '#3B82F6', link: '/account/orders' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, icon: <Clock size={18} />, color: '#F59E0B', link: '/account/orders' },
    { label: 'Quote Requests', value: quotes.length, icon: <FileText size={18} />, color: '#8B5CF6', link: '/account/quotes' },
    { label: 'Active Quotes', value: quotes.filter(q => ['New', 'Reviewed'].includes(q.status)).length, icon: <CheckCircle size={18} />, color: '#10B981', link: '/account/quotes' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-display font-extrabold text-charcoal">Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-sm text-charcoal-400 mt-1">Manage your orders, track quotes, and update your profile.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={s.link} className="premium-card p-5 flex items-center gap-4 hover:border-primary-100 block">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.color + '18', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-charcoal">{s.value}</p>
                <p className="text-[10px] text-charcoal-400 font-medium">{s.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="premium-card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal">Recent Orders</h3>
          <Link to="/account/orders" className="text-xs font-semibold text-primary hover:text-primary-700 flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-charcoal-400">
            <Package size={32} className="mb-3 text-charcoal-200" />
            <p className="text-sm mb-3">No orders yet. Start browsing our catalogue.</p>
            <Link to="/products" className="btn btn-primary btn-sm">Browse Products</Link>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-section/30 transition-colors">
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal text-xs">{o.orderNumber}</p>
                  <p className="text-[10px] text-charcoal-400">
                    {new Date(o.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{o.items?.length || 0} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-charcoal">KES {o.totalAmount?.toLocaleString() || '—'}</span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Quotes */}
      <div className="premium-card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal">Recent Quotes</h3>
          <Link to="/account/quotes" className="text-xs font-semibold text-primary hover:text-primary-700 flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        {quotes.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-charcoal-400">
            <FileText size={32} className="mb-3 text-charcoal-200" />
            <p className="text-sm mb-3">No quotes yet. Request one for any product.</p>
            <Link to="/quote" className="btn btn-primary btn-sm">Request a Quote</Link>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {quotes.slice(0, 5).map(q => (
              <div key={q.id} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-section/30 transition-colors">
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal text-xs">{q.quoteNumber}</p>
                  <p className="text-[10px] text-charcoal-400">
                    {new Date(q.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{q.items?.length || 0} item(s)
                  </p>
                </div>
                <StatusBadge status={q.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Orders ────────────────────────────────────────── */
function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/orders/my')
      .then(r => setOrders(r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-display font-extrabold text-charcoal">My Orders</h2>
        <p className="text-sm text-charcoal-400 mt-1">Track and manage all your equipment orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Package size={48} className="mb-4 text-charcoal-200" />
          <h3 className="text-lg font-bold text-charcoal mb-2">No Orders Yet</h3>
          <p className="text-sm text-charcoal-400 mb-6 max-w-sm">Place your first order by browsing our product catalogue.</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="premium-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-bold text-charcoal">{order.orderNumber}</p>
                  <p className="text-[10px] text-charcoal-400">
                    {new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="px-5 py-3 divide-y divide-border/30">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-charcoal">{item.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-charcoal-400">× {item.quantity}</span>
                      <span className="font-semibold text-charcoal">KES {(item.price * item.quantity).toLocaleString() || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-section/50 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 text-xs text-charcoal-400">
                  <span>Payment: <strong className="text-charcoal-600">{order.paymentMethod}</strong></span>
                  <StatusBadge status={order.paymentStatus} />
                </div>
                <div className="text-sm font-bold text-charcoal">
                  Total: KES {order.totalAmount?.toLocaleString() || '—'}
                </div>
              </div>
              {order.notes && (
                <div className="px-5 py-2 text-xs text-charcoal-400 italic border-t border-border/30">
                  Notes: {order.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Quotes ────────────────────────────────────────── */
function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/quotes/my')
      .then(r => setQuotes(r.data || []))
      .catch(() => setQuotes([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="spinner" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl lg:text-2xl font-display font-extrabold text-charcoal">My Quote Requests</h2>
          <p className="text-sm text-charcoal-400 mt-1">View all your submitted quote requests and their responses.</p>
        </div>
        <Link to="/quote" className="btn btn-primary btn-sm">New Quote Request</Link>
      </div>

      {quotes.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <FileText size={48} className="mb-4 text-charcoal-200" />
          <h3 className="text-lg font-bold text-charcoal mb-2">No Quote Requests</h3>
          <p className="text-sm text-charcoal-400 mb-6 max-w-sm">Request a quote for any equipment we supply.</p>
          <Link to="/quote" className="btn btn-primary">Request a Quote</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map(quote => (
            <div key={quote.id} className="premium-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-bold text-charcoal">{quote.quoteNumber}</p>
                  <p className="text-[10px] text-charcoal-400">
                    {new Date(quote.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <StatusBadge status={quote.status} />
              </div>
              <div className="px-5 py-3 divide-y divide-border/30">
                {quote.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-charcoal">{item.productName}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-charcoal-400">× {item.quantity}</span>
                      {item.notes && <span className="text-xs text-charcoal-200 italic">{item.notes}</span>}
                    </div>
                  </div>
                ))}
              </div>
              {quote.message && (
                <div className="px-5 py-2 text-xs text-charcoal-400 border-t border-border/30">
                  <span className="font-medium text-charcoal-600">Message:</span> {quote.message}
                </div>
              )}
              {quote.quotedPrice && (
                <div className="px-5 py-2 bg-accent-light/30 border-t border-accent/10 text-sm font-bold text-accent-dark">
                  Quoted Price: KES {quote.quotedPrice?.toLocaleString()}
                </div>
              )}
              {quote.responseMessage && (
                <div className="px-5 py-2 text-xs text-charcoal-400 border-t border-border/30">
                  <span className="font-medium text-charcoal-600">Response:</span> {quote.responseMessage}
                </div>
              )}
              {quote.respondedAt && (
                <div className="px-5 py-2 text-[10px] text-charcoal-200 border-t border-border/30">
                  Responded on {new Date(quote.respondedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Profile ───────────────────────────────────────── */
function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company: user?.company || '',
    address: user?.address || {}
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.phone && !isValidKenyanPhone(form.phone)) return toast.error(KENYAN_PHONE_HINT);
    setLoading(true);
    try {
      await updateProfile({ ...form, phone: form.phone ? normalizeKenyanPhone(form.phone) : '' });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl lg:text-2xl font-display font-extrabold text-charcoal">Profile Settings</h2>
        <p className="text-sm text-charcoal-400 mt-1">Update your contact information and account details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="premium-card p-5">
          <h3 className="text-sm font-bold text-charcoal mb-4">Personal Information</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input className="form-input pl-9" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input className="form-input pl-9" value={user?.email} disabled style={{ opacity: 0.6 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone / WhatsApp</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input className="form-input pl-9" inputMode="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0790 080 903" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Institution / Company</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input className="form-input pl-9" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Hospital or clinic name" />
              </div>
            </div>
          </div>
        </div>

        <div className="premium-card p-5">
          <h3 className="text-sm font-bold text-charcoal mb-4">Account Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 px-3 bg-section rounded-lg text-sm">
              <span className="text-charcoal-600">Account Type</span>
              <span className="badge-primary text-[9px]">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-section rounded-lg text-sm">
              <span className="text-charcoal-600">Member Since</span>
              <span className="text-charcoal font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

/* ── Main Account Layout ──────────────────────────── */
export default function AccountPage() {
  const location = useLocation();
  const path = location.pathname;

  const activeTab = path.startsWith('/account/orders') ? '/account/orders'
    : path.startsWith('/account/quotes') ? '/account/quotes'
    : path.startsWith('/account/profile') ? '/account/profile'
    : '/account';

  return (
    <div className="min-h-screen">
      {/* Page Hero */}
      <section className="page-hero pt-28 pb-12 lg:pt-36 lg:pb-16">
        <div className="container-custom page-hero-content">
          <div className="page-hero-breadcrumb">
            <Link to="/">Home</Link> <ChevronRight size={10} /> <span>My Account</span>
          </div>
          <h1>My Account</h1>
          <p>Manage your orders, quotes, and profile settings</p>
        </div>
      </section>

      {/* Content */}
      <section className="section pt-8">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            <Sidebar active={activeTab} />
            <div className="flex-1 min-w-0">
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="quotes" element={<Quotes />} />
                <Route path="profile" element={<Profile />} />
              </Routes>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}