import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Package, ShoppingCart, FileText,
  TrendingUp, MessageSquare, ArrowRight, AlertCircle
} from 'lucide-react';
import './AdminDashboard.css';

const STATUS_COLORS = {
  Pending: '#F59E0B', Confirmed: '#3B82F6', Processing: '#8B5CF6',
  Shipped: '#06B6D4', Delivered: '#10B981', Cancelled: '#EF4444',
  New: '#F59E0B', Reviewed: '#3B82F6', Quoted: '#10B981',
  Accepted: '#10B981', Declined: '#EF4444',
};

function StatCard({ label, value, icon, sub, color, link }) {
  const card = (
    <div className="dash-stat-card" style={{ borderTopColor: color }}>
      <div className="dsc-icon" style={{ background: color + '18', color }}>{icon}</div>
      <div className="dsc-body">
        <span className="dsc-val">{value}</span>
        <span className="dsc-label">{label}</span>
        {sub && <span className="dsc-sub">{sub}</span>}
      </div>
    </div>
  );
  return link ? <Link to={link} style={{ textDecoration: 'none' }}>{card}</Link> : card;
}

function MiniBar({ label, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mini-bar-row">
      <span className="mini-bar-label">{label}</span>
      <div className="mini-bar-track">
        <div className="mini-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="mini-bar-val">{value}</span>
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

  if (loading) return <div className="admin-loading"><div className="spinner" /></div>;
  if (!data)   return <div className="admin-empty"><AlertCircle size={40} /><h4>Failed to load dashboard</h4></div>;

  const { totals, recentOrders, recentQuotes, ordersByStatus, salesByCategory, monthlyRevenue } = data;

  const maxSales = Math.max(...(salesByCategory?.map(s => parseInt(s.units_sold)) || [1]), 1);
  const maxRevenue = Math.max(...(monthlyRevenue?.map(m => parseFloat(m.revenue)) || [1]), 1);

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back — here's what's happening with medithrex today.</p>
        </div>
        <span className="dash-date">{new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="dash-stats-grid">
        <StatCard label="Total Revenue" value={`KES ${totals.revenue.toLocaleString()}`} icon={<TrendingUp size={22} />} sub="Confirmed orders" color="#F5C300" link="/admin/orders" />
        <StatCard label="Total Orders"  value={totals.orders}  icon={<ShoppingCart size={22} />} sub="All time" color="#3B82F6" link="/admin/orders" />
        <StatCard label="Quote Requests" value={totals.quotes} icon={<FileText size={22} />} sub="All time" color="#8B5CF6" link="/admin/quotes" />
        <StatCard label="Customers"     value={totals.users}   icon={<Users size={22} />}       sub="Registered" color="#10B981" link="/admin/users" />
        <StatCard label="Products"      value={totals.products} icon={<Package size={22} />}    sub="In catalogue" color="#F59E0B" link="/admin/products" />
        <StatCard label="Unread Messages" value={totals.unreadMessages} icon={<MessageSquare size={22} />} sub="Need attention" color="#EF4444" link="/admin/messages" />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────── */}
      <div className="dash-charts-grid">

        {/* Monthly Revenue Bar Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Monthly Revenue (Last 6 Months)</h3>
          </div>
          <div className="revenue-chart">
            {monthlyRevenue?.length === 0 ? (
              <div className="admin-empty" style={{ padding: '40px' }}><p>No revenue data yet</p></div>
            ) : (
              <div className="bar-chart">
                {(monthlyRevenue || []).map((m, i) => {
                  const h = maxRevenue > 0 ? Math.max(8, (parseFloat(m.revenue) / maxRevenue) * 140) : 8;
                  return (
                    <div key={i} className="bar-col">
                      <div className="bar-tooltip">KES {parseFloat(m.revenue).toLocaleString()}<br />{m.order_count} orders</div>
                      <div className="bar-fill" style={{ height: `${h}px` }} />
                      <span className="bar-label">{m.month?.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>Orders by Status</h3></div>
          <div className="status-chart">
            {ordersByStatus?.length === 0 ? (
              <div className="admin-empty" style={{ padding: '40px' }}><p>No orders yet</p></div>
            ) : (
              <>
                <div className="donut-wrap">
                  <div className="donut-legend">
                    {ordersByStatus?.map(s => (
                      <div key={s.status} className="donut-legend-item">
                        <span className="donut-dot" style={{ background: STATUS_COLORS[s.status] || '#888' }} />
                        <span className="donut-legend-label">{s.status}</span>
                        <span className="donut-legend-val">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="status-bars">
                  {ordersByStatus?.map(s => {
                    const maxCount = Math.max(...ordersByStatus.map(x => parseInt(x.count)));
                    return (
                      <div key={s.status} className="status-bar-row">
                        <span className="status-bar-label" style={{ color: STATUS_COLORS[s.status] }}>{s.status}</span>
                        <div className="status-bar-track">
                          <div className="status-bar-fill"
                            style={{ width: `${(parseInt(s.count) / maxCount) * 100}%`, background: STATUS_COLORS[s.status] }} />
                        </div>
                        <span className="status-bar-count">{s.count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>Top Categories by Units Sold</h3></div>
          <div className="category-chart">
            {salesByCategory?.length === 0 ? (
              <div className="admin-empty" style={{ padding: '40px' }}><p>No sales data yet</p></div>
            ) : (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(salesByCategory || []).map(s => (
                  <MiniBar key={s.category} label={s.category} value={parseInt(s.units_sold)} max={maxSales} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent tables ───────────────────────────────────────────────── */}
      <div className="dash-tables-grid">

        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="btn btn-outline btn-sm">View All <ArrowRight size={14} /></Link>
          </div>
          {recentOrders?.length === 0 ? (
            <div className="admin-empty"><ShoppingCart size={32} strokeWidth={1} /><p>No orders yet</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders?.map(o => (
                    <tr key={o.id}>
                      <td><Link to={`/admin/orders`} className="admin-link">{o.order_number}</Link></td>
                      <td>
                        <div className="td-name">{o.customer_name || 'Guest'}</div>
                        <div className="td-sub">{o.customer_email}</div>
                      </td>
                      <td className="td-mono">KES {parseFloat(o.total_amount || 0).toLocaleString()}</td>
                      <td><span className="badge" style={{ background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}40` }}>{o.status}</span></td>
                      <td className="td-date">{new Date(o.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Quotes */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Recent Quote Requests</h3>
            <Link to="/admin/quotes" className="btn btn-outline btn-sm">View All <ArrowRight size={14} /></Link>
          </div>
          {recentQuotes?.length === 0 ? (
            <div className="admin-empty"><FileText size={32} strokeWidth={1} /><p>No quotes yet</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Quote #</th><th>Contact</th><th>Company</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {recentQuotes?.map(q => (
                    <tr key={q.id}>
                      <td><span className="td-mono">{q.quote_number}</span></td>
                      <td>
                        <div className="td-name">{q.name}</div>
                        <div className="td-sub">{q.phone}</div>
                      </td>
                      <td className="td-sub">{q.company || '—'}</td>
                      <td><span className="badge" style={{ background: STATUS_COLORS[q.status] + '22', color: STATUS_COLORS[q.status], border: `1px solid ${STATUS_COLORS[q.status]}40` }}>{q.status}</span></td>
                      <td className="td-date">{new Date(q.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
