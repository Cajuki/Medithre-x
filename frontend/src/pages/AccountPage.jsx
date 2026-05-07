import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { isValidKenyanPhone, normalizeKenyanPhone, KENYAN_PHONE_HINT } from '../utils/validation.js';
import {
  User, Package, FileText, LogOut, ChevronRight,
  CheckCircle, Clock, Truck, XCircle, Edit3, Save
} from 'lucide-react';
import './AccountPage.css';

/* ── Sidebar ─────────────────────────────────────── */
function Sidebar({ active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const links = [
    { path: '/account', label: 'Dashboard', icon: <User size={18} /> },
    { path: '/account/orders', label: 'My Orders', icon: <Package size={18} /> },
    { path: '/account/quotes', label: 'My Quotes', icon: <FileText size={18} /> },
    { path: '/account/profile', label: 'Profile Settings', icon: <Edit3 size={18} /> },
  ];

  return (
    <aside className="account-sidebar">
      <div className="account-user">
        <div className="account-avatar">{user?.name?.slice(0, 2).toUpperCase()}</div>
        <div>
          <strong>{user?.name}</strong>
          <span>{user?.company || user?.email}</span>
        </div>
      </div>
      <nav className="account-nav">
        {links.map(l => (
          <Link key={l.path} to={l.path} className={`account-nav-link${active === l.path ? ' active' : ''}`}>
            {l.icon} {l.label} <ChevronRight size={14} className="nav-arrow" />
          </Link>
        ))}
        <button className="account-nav-link logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Sign Out
        </button>
      </nav>
    </aside>
  );
}

/* ── Status badge helper ─────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    Pending: { cls: 'badge-grey', icon: <Clock size={12} /> },
    Confirmed: { cls: 'badge-dark', icon: <CheckCircle size={12} /> },
    Processing: { cls: 'badge-yellow', icon: <Clock size={12} /> },
    Shipped: { cls: 'badge-dark', icon: <Truck size={12} /> },
    Delivered: { cls: 'badge-green', icon: <CheckCircle size={12} /> },
    Cancelled: { cls: 'badge-red', icon: <XCircle size={12} /> },
    New: { cls: 'badge-yellow', icon: <Clock size={12} /> },
    Reviewed: { cls: 'badge-dark', icon: <CheckCircle size={12} /> },
    Quoted: { cls: 'badge-green', icon: <CheckCircle size={12} /> },
    Accepted: { cls: 'badge-green', icon: <CheckCircle size={12} /> },
    Declined: { cls: 'badge-red', icon: <XCircle size={12} /> },
  };
  const s = map[status] || { cls: 'badge-grey', icon: null };
  return (
    <span className={`badge ${s.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {s.icon} {status}
    </span>
  );
}

/* ── Dashboard ───────────────────────────────────── */
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

  if (loading) return <div className="account-loading"><div className="spinner" /></div>;

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: <Package size={22} />, link: '/account/orders' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, icon: <Clock size={22} />, link: '/account/orders' },
    { label: 'Quote Requests', value: quotes.length, icon: <FileText size={22} />, link: '/account/quotes' },
    { label: 'Active Quotes', value: quotes.filter(q => ['New', 'Reviewed'].includes(q.status)).length, icon: <CheckCircle size={22} />, link: '/account/quotes' },
  ];

  return (
    <div className="account-content">
      <div className="account-page-header">
        <h2>Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p>Manage your orders, track quotes, and update your profile.</p>
      </div>

      <div className="dashboard-stats">
        {stats.map(s => (
          <Link key={s.label} to={s.link} className="dash-stat-card">
            <div className="dash-stat-icon">{s.icon}</div>
            <div>
              <span className="dash-stat-val">{s.value}</span>
              <span className="dash-stat-label">{s.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="account-section">
        <div className="account-section-head">
          <h3>Recent Orders</h3>
          <Link to="/account/orders" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {orders.length === 0 ? (
          <div className="account-empty">
            <Package size={36} strokeWidth={1} />
            <p>No orders yet. <Link to="/products">Browse products</Link> to place your first order.</p>
          </div>
        ) : (
          <div className="orders-table">
            <div className="orders-table-head">
              <span>Order #</span><span>Date</span><span>Items</span><span>Total</span><span>Status</span>
            </div>
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="orders-table-row">
                <span className="order-num-cell">{o.orderNumber}</span>
                <span>{new Date(o.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</span>
                <span className="order-total-cell">KES {o.totalAmount?.toLocaleString() || '—'}</span>
                <span><StatusBadge status={o.status} /></span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent quotes */}
      <div className="account-section">
        <div className="account-section-head">
          <h3>Recent Quotes</h3>
          <Link to="/account/quotes" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {quotes.length === 0 ? (
          <div className="account-empty">
            <FileText size={36} strokeWidth={1} />
            <p>No quotes yet. <Link to="/quote">Request a quote</Link> for any product.</p>
          </div>
        ) : (
          <div className="orders-table">
            <div className="orders-table-head">
              <span>Quote #</span><span>Date</span><span>Items</span><span>Status</span>
            </div>
            {quotes.slice(0, 5).map(q => (
              <div key={q.id} className="orders-table-row">
                <span className="order-num-cell">{q.quoteNumber}</span>
                <span>{new Date(q.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span>{q.items?.length} item{q.items?.length !== 1 ? 's' : ''}</span>
                <span><StatusBadge status={q.status} /></span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="account-quick-actions">
        <Link to="/products" className="quick-action">
          <Package size={20} />
          <span>Browse Products</span>
        </Link>
        <Link to="/quote" className="quick-action">
          <FileText size={20} />
          <span>Request Quote</span>
        </Link>
        <Link to="/contact" className="quick-action">
          <User size={20} />
          <span>Contact Support</span>
        </Link>
      </div>
    </div>
  );
}

/* ── Orders ──────────────────────────────────────── */
function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/orders/my')
      .then(r => setOrders(r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="account-loading"><div className="spinner" /></div>;

  return (
    <div className="account-content">
      <div className="account-page-header">
        <h2>My Orders</h2>
        <p>Track and manage all your equipment orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="account-empty large">
          <Package size={56} strokeWidth={1} />
          <h3>No Orders Yet</h3>
          <p>Place your first order by browsing our product catalogue.</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-card-num">{order.orderNumber}</span>
                  <span className="order-card-date">
                    {new Date(order.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="order-card-items">
                {order.items?.map((item, i) => (
                  <div key={i} className="order-card-item">
                    <span className="order-item-name">{item.name}</span>
                    <span className="order-item-qty">× {item.quantity}</span>
                    <span className="order-item-price">
                      {item.price ? `KES ${(item.price * item.quantity).toLocaleString()}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="order-card-footer">
                <div className="order-card-meta">
                  <span>Payment: <strong>{order.paymentMethod}</strong></span>
                  <span>
                    <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-green' : 'badge-grey'}`}>
                      {order.paymentStatus}
                    </span>
                  </span>
                </div>
                <div className="order-card-total">
                  Total: <strong>KES {order.totalAmount?.toLocaleString() || '—'}</strong>
                </div>
              </div>
              {order.notes && (
                <div className="order-card-notes">Notes: {order.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Quotes ──────────────────────────────────────── */
function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/quotes/my')
      .then(r => setQuotes(r.data || []))
      .catch(() => setQuotes([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="account-loading"><div className="spinner" /></div>;

  return (
    <div className="account-content">
      <div className="account-page-header">
        <div>
          <h2>My Quote Requests</h2>
          <p>View all your submitted quote requests and their responses.</p>
        </div>
        <Link to="/quote" className="btn btn-primary">New Quote Request</Link>
      </div>

      {quotes.length === 0 ? (
        <div className="account-empty large">
          <FileText size={56} strokeWidth={1} />
          <h3>No Quote Requests</h3>
          <p>Request a quote for any equipment we supply.</p>
          <Link to="/quote" className="btn btn-primary">Request a Quote</Link>
        </div>
      ) : (
        <div className="orders-list">
          {quotes.map(quote => (
            <div key={quote.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-card-num">{quote.quoteNumber}</span>
                  <span className="order-card-date">
                    {new Date(quote.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <StatusBadge status={quote.status} />
              </div>
              <div className="order-card-items">
                {quote.items?.map((item, i) => (
                  <div key={i} className="order-card-item">
                    <span className="order-item-name">{item.productName}</span>
                    <span className="order-item-qty">× {item.quantity}</span>
                    {item.notes && <span className="order-item-note">{item.notes}</span>}
                  </div>
                ))}
              </div>
              {quote.message && (
                <div className="order-card-notes">Message: {quote.message}</div>
              )}
              {quote.quotedPrice && (
                <div className="quoted-price-row">
                  Quoted Price: <strong>KES {quote.quotedPrice?.toLocaleString()}</strong>
                </div>
              )}
              {quote.responseMessage && (
                <div className="order-card-notes">Response: {quote.responseMessage}</div>
              )}
              {quote.respondedAt && (
                <div className="order-card-notes">
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

/* ── Profile ─────────────────────────────────────── */
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
    <div className="account-content">
      <div className="account-page-header">
        <h2>Profile Settings</h2>
        <p>Update your contact information and account details.</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="profile-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone / WhatsApp</label>
              <input className="form-input" inputMode="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0790 080 903" />
            </div>
            <div className="form-group">
              <label className="form-label">Institution / Company</label>
              <input className="form-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Hospital or clinic name" />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Account Details</h3>
          <div className="profile-info-row">
            <span>Account Type</span>
            <span className="badge badge-dark">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</span>
          </div>
          <div className="profile-info-row">
            <span>Member Since</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }) : 'N/A'}</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

/* ── Main Account layout ─────────────────────────── */
export default function AccountPage() {
  const location = useLocation();
  const path = location.pathname;

  const activeTab = path.startsWith('/account/orders') ? '/account/orders'
    : path.startsWith('/account/quotes') ? '/account/quotes'
    : path.startsWith('/account/profile') ? '/account/profile'
    : '/account';

  return (
    <div className="account-page">
      <div className="page-hero" style={{ padding: '40px 0 32px' }}>
        <div className="container page-hero-content">
          <p className="section-label">Your Account</p>
          <h1 style={{ fontSize: '2.5rem' }}>My Account</h1>
        </div>
      </div>

      <div className="container account-layout">
        <Sidebar active={activeTab} />
        <div className="account-main">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
