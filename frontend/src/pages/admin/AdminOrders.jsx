import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './AdminPages.css';

const STATUSES     = ['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'];
const PAY_STATUSES = ['Unpaid','Paid','Partial'];

const STATUS_COLORS = {
  Pending:'#F59E0B',Confirmed:'#3B82F6',Processing:'#8B5CF6',
  Shipped:'#06B6D4',Delivered:'#10B981',Cancelled:'#EF4444',
};

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const r = await axios.get(`/api/admin/orders?${params}`);
      setOrders(r.data.orders); setTotal(r.data.total);
      setPages(r.data.pages);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  const openOrder = async (id) => {
    try {
      const r = await axios.get(`/api/admin/orders/${id}`);
      setSelected(r.data);
    } catch { toast.error('Failed to load order details'); }
  };

  const updateStatus = async (orderId, newStatus, payStatus) => {
    setUpdating(true);
    try {
      const r = await axios.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus, payment_status: payStatus
      });
      setSelected(prev => prev ? { ...prev, ...r.data } : null);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...r.data } : o));
      toast.success('Order updated');
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  return (
     <>
       <div className="admin-page-header">
        <div><h1>Orders</h1><p>{total} total orders</p></div>
      </div>

      <div className="admin-card">
        {/* Filters */}
        <div className="admin-card-header">
          <div className="admin-filters">
            <div className="admin-search-wrap">
              <Search size={15} />
              <input className="admin-search" placeholder="Search by order # or customer..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="admin-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total (KES)</th><th>Payment</th><th>Status</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={8}><div className="admin-empty"><p>No orders found</p></div></td></tr>
                ) : orders.map(o => (
                  <tr key={o.id}>
                    <td><span className="td-bold">{o.order_number}</span></td>
                    <td>
                      <div className="td-name">{o.customer_name || 'Guest'}</div>
                      <div className="td-sub">{o.customer_email}</div>
                    </td>
                    <td className="td-center">—</td>
                    <td className="td-bold">{parseFloat(o.total_amount||0).toLocaleString()}</td>
                    <td><span className={`badge ${o.payment_status === 'Paid' ? 'badge-green' : o.payment_status === 'Partial' ? 'badge-yellow' : 'badge-grey'}`}>{o.payment_status}</span></td>
                    <td>
                      <span className="status-pill" style={{ background: STATUS_COLORS[o.status] + '20', color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}50` }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="td-date">{new Date(o.created_at).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })}</td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn primary" onClick={() => openOrder(o.id)} title="View"><Eye size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="admin-pagination">
          <span>Showing {orders.length} of {total}</span>
          <div className="admin-page-btns">
            <button className="admin-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
            {[...Array(pages)].map((_,i) => (
              <button key={i} className={`admin-page-btn${page === i+1 ? ' active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="admin-page-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Order {selected.order_number}</h3>
                <p>{new Date(selected.created_at).toLocaleString('en-KE')}</p>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>

            <div className="admin-modal-body">
              {/* Customer */}
              <div className="modal-section">
                <h4>Customer</h4>
                <div className="modal-grid-2">
                  <div><label>Name</label><p>{selected.customer_name || 'Guest'}</p></div>
                  <div><label>Email</label><p>{selected.customer_email || '—'}</p></div>
                  <div><label>Phone</label><p>{selected.customer_phone || '—'}</p></div>
                  <div><label>Payment</label><p>{selected.payment_method}</p></div>
                </div>
              </div>

              {/* Shipping */}
              <div className="modal-section">
                <h4>Shipping Address</h4>
                <p>{[selected.street, selected.city, selected.county, selected.country].filter(Boolean).join(', ') || '—'}</p>
              </div>

              {/* Items */}
              <div className="modal-section">
                <h4>Items</h4>
                <div className="modal-items">
                  {selected.items?.map((item, i) => (
                    <div key={i} className="modal-item-row">
                      <span className="modal-item-name">{item.name}</span>
                      <span className="modal-item-qty">× {item.quantity}</span>
                      <span className="modal-item-price">KES {((item.price||0) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="modal-item-total">
                    <span>Total</span>
                    <span>KES {parseFloat(selected.total_amount||0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Update status */}
              <div className="modal-section">
                <h4>Update Status</h4>
                <div className="modal-grid-2">
                  <div>
                    <label>Order Status</label>
                    <select className="form-select" defaultValue={selected.status}
                      onChange={e => updateStatus(selected.id, e.target.value, null)}
                      disabled={updating}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label>Payment Status</label>
                    <select className="form-select" defaultValue={selected.payment_status}
                      onChange={e => updateStatus(selected.id, null, e.target.value)}
                      disabled={updating}>
                      {PAY_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {selected.notes && <div className="modal-section"><h4>Notes</h4><p className="modal-notes">{selected.notes}</p></div>}
            </div>
          </div>
        </div>
       )}
     </>
  );
}
