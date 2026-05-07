import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, X, Shield } from 'lucide-react';
import './AdminPages.css';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (role)   params.set('role', role);
      const r = await axios.get(`/api/admin/users?${params}`);
      setUsers(r.data.users); setTotal(r.data.total); setPages(r.data.pages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, role]);

  useEffect(() => { load(); }, [load]);

  const openUser = async (id) => {
    try {
      const r = await axios.get(`/api/admin/users/${id}`);
      setSelected(r.data);
    } catch { toast.error('Failed to load user'); }
  };

  const updateRole = async (userId, newRole) => {
    try {
      const user = users.find(u => u.id === userId);
      await axios.put(`/api/admin/users/${userId}`, { ...user, role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selected?.id === userId) setSelected(prev => ({ ...prev, role: newRole }));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      setSelected(null);
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div><h1>Users</h1><p>{total} registered accounts</p></div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filters">
            <div className="admin-search-wrap">
              <Search size={15} />
              <input className="admin-search" placeholder="Search by name, email, company..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="admin-select" value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
              <option value="">All Roles</option>
              <option value="user">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Phone</th><th>Company</th><th>County</th><th>Role</th><th>Joined</th><th></th></tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7}><div className="admin-empty"><p>No users found</p></div></td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-table-avatar">{u.name?.slice(0,2).toUpperCase()}</div>
                        <div>
                          <div className="td-name">{u.name}</div>
                          <div className="td-sub">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-sub">{u.phone || '—'}</td>
                    <td className="td-sub">{u.company || '—'}</td>
                    <td className="td-sub">{u.county || '—'}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-yellow' : 'badge-grey'}`}>
                        {u.role === 'admin' ? '⚡ Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="td-date">{new Date(u.created_at).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })}</td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn primary" onClick={() => openUser(u.id)} title="View"><Eye size={15} /></button>
                        <button className="action-btn danger" onClick={() => deleteUser(u.id)} title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-pagination">
          <span>Showing {users.length} of {total}</span>
          <div className="admin-page-btns">
            <button className="admin-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
            {[...Array(Math.min(pages,5))].map((_,i) => (
              <button key={i} className={`admin-page-btn${page === i+1 ? ' active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="admin-page-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="user-table-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>{selected.name?.slice(0,2).toUpperCase()}</div>
                <div>
                  <h3>{selected.name}</h3>
                  <p>{selected.email}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <div className="modal-section">
                <h4>Account Info</h4>
                <div className="modal-grid-2">
                  <div><label>Phone</label><p>{selected.phone || '—'}</p></div>
                  <div><label>Company</label><p>{selected.company || '—'}</p></div>
                  <div><label>County</label><p>{selected.county || '—'}</p></div>
                  <div><label>Joined</label><p>{new Date(selected.created_at).toLocaleDateString('en-KE', { day:'numeric', month:'long', year:'numeric' })}</p></div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Role Management</h4>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className={`btn ${selected.role === 'user' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    onClick={() => updateRole(selected.id, 'user')}>
                    Customer
                  </button>
                  <button className={`btn ${selected.role === 'admin' ? 'btn-dark' : 'btn-outline'} btn-sm`}
                    onClick={() => updateRole(selected.id, 'admin')}>
                    <Shield size={14} /> Admin
                  </button>
                </div>
              </div>

              <div className="modal-section">
                <h4>Order History ({selected.orders?.length || 0})</h4>
                {selected.orders?.length === 0 ? <p style={{ color: 'var(--grey)', fontSize: '0.85rem' }}>No orders placed</p> : (
                  <div className="modal-items">
                    {selected.orders?.slice(0,5).map(o => (
                      <div key={o.id} className="modal-item-row">
                        <span className="modal-item-name">{o.order_number}</span>
                        <span className="modal-item-qty">{o.status}</span>
                        <span className="modal-item-price">KES {parseFloat(o.total_amount||0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-section">
                <h4>Quote History ({selected.quotes?.length || 0})</h4>
                {selected.quotes?.length === 0 ? <p style={{ color: 'var(--grey)', fontSize: '0.85rem' }}>No quotes submitted</p> : (
                  <div className="modal-items">
                    {selected.quotes?.slice(0,5).map(q => (
                      <div key={q.id} className="modal-item-row">
                        <span className="modal-item-name">{q.quote_number}</span>
                        <span className="modal-item-qty">{q.status}</span>
                        <span className="modal-item-price">{new Date(q.created_at).toLocaleDateString('en-KE')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                onClick={() => deleteUser(selected.id)}>
                <Trash2 size={14} /> Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
