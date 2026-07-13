import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Users, Package, ShoppingCart, FileText,
  TrendingUp, MessageSquare, ArrowRight, AlertCircle,
  DollarSign, BarChart3, Activity, Clock
} from 'lucide-react';

const STATUS_COLORS = {
  Pending: '#F59E0B', Confirmed: '#3B82F6', Processing: '#8B5CF6',
  Shipped: '#06B6D4', Delivered: '#10B981', Cancelled: '#EF4444',
  New: '#F59E0B', Reviewed: '#3B82F6', Quoted: '#10B981',
  Accepted: '#10B981', Declined: '#EF4444',
};

function StatCard({ label, value, icon, sub, color, link, delay = 0 }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="premium-card p-5 flex items-start gap-4 hover:border-primary-100 cursor-pointer"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '18', color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-charcoal">{value}</p>
        <p className="text-xs text-charcoal-400 font-medium mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-charcoal-200 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
  return link ? <Link to={link} className="block no-underline">{content}</Link> : content;
}

function MiniBar({ label, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-charcoal-600 font-medium w-32 truncate shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-section rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
        />
      </div>
      <span className="text-xs font-semibold text-charcoal-600 w-12 text-right">{value}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="spinner" />
    </div>
  );
  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle size={40} className="text-charcoal-400 mb-3" />
      <p className="text-charcoal-600 font-medium">Failed to load dashboard</p>
    </div>
  );

  const { totals, recentOrders, recentQuotes, ordersByStatus, salesByCategory, monthlyRevenue } = data;
  const maxSales = Math.max(...(salesByCategory?.map(s => parseInt(s.units_sold)) || [1]), 1);
  const maxRevenue = Math.max(...(monthlyRevenue?.map(m => parseFloat(m.revenue)) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-charcoal">Dashboard</h1>
          <p className="text-sm text-charcoal-400 mt-1">Welcome back — here's what's happening today.</p>
        </div>
        <span className="text-xs text-charcoal-400 bg-section px-3 py-1.5 rounded-lg border border-border">
          {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Revenue" value={`KES ${(totals.revenue || 0).toLocaleString()}`} icon={<DollarSign size={20} />} sub="Confirmed orders" color="#F5C300" link="/admin/orders" delay={0} />
        <StatCard label="Total Orders"  value={totals.orders || 0}  icon={<ShoppingCart size={20} />} sub="All time" color="#3B82F6" link="/admin/orders" delay={0.05} />
        <StatCard label="Quote Requests" value={totals.quotes || 0} icon={<FileText size={20} />} sub="All time" color="#8B5CF6" link="/admin/quotes" delay={0.1} />
        <StatCard label="Customers"     value={totals.users || 0}   icon={<Users size={20} />}       sub="Registered" color="#10B981" link="/admin/users" delay={0.15} />
        <StatCard label="Products"      value={totals.products || 0} icon={<Package size={20} />}    sub="In catalogue" color="#F59E0B" link="/admin/products" delay={0.2} />
        <StatCard label="Unread Messages" value={totals.unreadMessages || 0} icon={<MessageSquare size={20} />} sub="Need attention" color="#EF4444" link="/admin/messages" delay={0.25} />
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Monthly Revenue */}
        <div className="lg:col-span-2 premium-card">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-charcoal">Monthly Revenue (Last 6 Months)</h3>
          </div>
          <div className="p-5">
            {monthlyRevenue?.length === 0 ? (
              <div className="text-center py-10 text-charcoal-400 text-sm">No revenue data yet</div>
            ) : (
              <div className="flex items-end justify-between gap-3 h-40">
                {(monthlyRevenue || []).map((m, i) => {
                  const h = maxRevenue > 0 ? Math.max(8, (parseFloat(m.revenue) / maxRevenue) * 140) : 8;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[9px] text-charcoal-400 font-medium">KES {parseFloat(m.revenue).toLocaleString()}</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}px` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-primary to-primary-500 hover:from-secondary transition-all cursor-pointer"
                      />
                      <span className="text-[10px] text-charcoal-400 font-medium">{m.month?.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="premium-card">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-charcoal">Orders by Status</h3>
          </div>
          <div className="p-5 space-y-3">
            {ordersByStatus?.length === 0 ? (
              <div className="text-center py-10 text-charcoal-400 text-sm">No orders yet</div>
            ) : (
              ordersByStatus?.map(s => {
                const maxCount = Math.max(...ordersByStatus.map(x => parseInt(x.count)));
                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold" style={{ color: STATUS_COLORS[s.status] }}>{s.status}</span>
                      <span className="text-charcoal-600 font-bold">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-section rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(parseInt(s.count) / maxCount) * 100}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ background: STATUS_COLORS[s.status] }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Sales by Category ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="premium-card">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-bold text-charcoal">Top Categories by Units Sold</h3>
          </div>
          <div className="p-5 space-y-4">
            {salesByCategory?.length === 0 ? (
              <div className="text-center py-10 text-charcoal-400 text-sm">No sales data yet</div>
            ) : (
              (salesByCategory || []).map(s => (
                <MiniBar key={s.category} label={s.category} value={parseInt(s.units_sold)} max={maxSales} />
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 premium-card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-primary hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {recentOrders?.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-charcoal-400">
              <ShoppingCart size={28} className="mb-2" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-section/50">
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Order #</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Customer</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Amount</th>
                    <th className="text-center px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders?.map(o => (
                    <tr key={o.id} className="border-b border-border/50 hover:bg-section/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link to="/admin/orders" className="text-primary font-semibold text-xs hover:underline">{o.order_number}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-charcoal">{o.customer_name || 'Guest'}</p>
                        <p className="text-[10px] text-charcoal-400">{o.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-charcoal text-right">KES {parseFloat(o.total_amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                          style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}40` }}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-charcoal-400 text-right">
                        {new Date(o.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Quotes ────────────────────────────────────────────────── */}
      <div className="premium-card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal">Recent Quote Requests</h3>
          <Link to="/admin/quotes" className="text-xs font-semibold text-primary hover:text-primary-700 flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        {recentQuotes?.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-charcoal-400">
            <FileText size={28} className="mb-2" />
            <p className="text-sm">No quotes yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-section/50">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Quote #</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Company</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotes?.map(q => (
                  <tr key={q.id} className="border-b border-border/50 hover:bg-section/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-charcoal-600">{q.quote_number}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-charcoal">{q.name}</p>
                      <p className="text-[10px] text-charcoal-400">{q.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal-400">{q.company || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: STATUS_COLORS[q.status] + '22', color: STATUS_COLORS[q.status], border: `1px solid ${STATUS_COLORS[q.status]}40` }}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-charcoal-400 text-right">
                      {new Date(q.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}